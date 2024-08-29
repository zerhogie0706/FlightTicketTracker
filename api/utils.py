import serpapi

API_KEY = '2ae9f0c5b9ac9a7ab9e8f04c61516c33077bebc791c6c909a64c529f656ce26a'


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
    search = serpapi.GoogleSearch(params)
    results = search.get_dict()
    print(results)

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
