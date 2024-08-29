from celery import shared_task
from .models import TrackingRecord
from .utils import search_flight


@shared_task
def fetch_tracking_records():
    records = TrackingRecord.objects.filter(id=1)
    # You can add your logic here to process these records
    for record in records:
        result = search_flight(
            record.departure_id,
            record.arrival_id,
            outbound_date=record.outbound_date,
            return_date=record.return_date,
        )
        print(result)
