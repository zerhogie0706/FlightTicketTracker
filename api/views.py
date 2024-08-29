from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from django.contrib import auth
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


from .models import TrackingRecord, BasicSetting
from .serializers import LoginSerializer
import serpapi

API_KEY = settings.GOOGLE_FLIGHT_API_KEY


def test(request):
    return HttpResponse('Success')


class LoginAPIView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            auth.login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def logout(request):
    auth.logout(request)
    return JsonResponse({})


class SignUpAPIView(APIView):
    # authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        currency = request.data.get('currency', 'TWD')  # Default to 'TWD' if not provided
        phone_number = request.data.get('phone_number')

        if not username or not password or not phone_number:
            return Response({'error': 'Username, password, and phone number are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if auth.models.User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        user = auth.models.User.objects.create_user(username=username, password=password)

        # Create the user profile
        up = user.userprofile
        up.currency = currency
        up.phone_number = phone_number
        up.save()

        return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)


class TrackingRecordViewSet(viewsets.ModelViewSet):
    queryset = TrackingRecord.objects.filter(is_active=True)

    permission_class = [IsAuthenticated]

    def list(self, request):
        user = request.user
        qs = self.get_queryset().filter(user=user)
        return Response({'data': [obj.as_dict() for obj in qs]})

    def create(self, request):
        user = request.user
        basic_setting = BasicSetting.objects.first()

        required_fields = {'departure_id', 'arrival_id', 'outbound_date', 'return_date', 'expectation'}
        data = {field: request.data.get(field) for field in required_fields}
        if any(value is None for value in data.values()):
            return Response({'error': 'Missing required fields'}, status=400)
        if user.userprofile.level == 'Basic' and user.tracking_records.count() >= basic_setting.basic_allowed:
            return Response({'error': 'Maximun records created'}, status=400)
        data['airlines'] = request.data.get('airlines')
        data['user'] = user
        record = TrackingRecord(**data)
        record.save()
        qs = self.get_queryset().filter(user=user)
        return Response({'data': [obj.as_dict() for obj in qs]})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user_id != request.user.id:
            return Response({'error': 'Can not delete others record'}, status=400)
        instance.is_active = False
        instance.save()
        return Response({})


def search_flight(departure, arrival, outbound_date, return_date):
    return _get_flight_info(departure, arrival, outbound_date, return_date)


def _get_flight_info(departure, arrival, outbound_date, return_date):
    params = {
        "engine": "google_flights",
        "hl": "zh-tw",
        "gl": "tw",
        "departure_id": departure,
        "arrival_id": arrival,
        "outbound_date": outbound_date,
        "return_date": return_date,
        "currency": "TWD",
        "type": "1",
        "stops": "1",
        "api_key": API_KEY,
    }
    search = serpapi.search(params)
    results = search.get_dict()

    # Best
    best_flights_info = []
    best_flights = results['best_flights']
    for flight in best_flights:
        flight_info = {}
        flight_info['airline'] = flight['flights'][0]['airline']
        flight_info['duration'] = flight['total_duration']
        flight_info['departure_time'] = flight['flights'][0]['departure_airport']['time']
        flight_info['arrival_time'] = flight['flights'][0]['arrival_airport']['time']
        flight_info['price'] = flight['price']
        best_flights_info.append(flight_info)
    
    # Others
    other_flights_info = []
    other_flights = results['other_flights']
    for flight in other_flights:
        flight_info = {}
        flight_info['airline'] = flight['flights'][0]['airline']
        flight_info['duration'] = flight['total_duration']
        flight_info['departure_time'] = flight['flights'][0]['departure_airport']['time']
        flight_info['arrival_time'] = flight['flights'][0]['arrival_airport']['time']
        flight_info['price'] = flight['price']
        other_flights_info.append(flight_info)
    
    return {
        'Best': best_flights_info,
        'Other': other_flights_info,
    }
