from celery import shared_task
from .models import TrackingRecord
from .utils import search_flight


@shared_task
def fetch_tracking_records():
    records = TrackingRecord.objects.filter(is_active=True)
    # You can add your logic here to process these records
    for record in records:
        result = search_flight(
            record.departure_id,
            record.arrival_id,
            outbound_date=record.outbound_date,
            return_date=record.return_date,
        )
        best_results = result['Best']
        other_results = result['Other']
        best_min = min([best_result['price'] for best_result in best_results]) if best_results else float('inf')
        other_min = min([other_result['price'] for other_result in other_results]) if other_results else float('inf')

        if best_min == float('inf') and other_min == float('inf'):
            continue

        if best_min < other_min:
            lowest = best_min
            recommend = [res for res in best_results if res['price'] == best_min][0]
        else:
            lowest = other_min
            recommend = [res for res in other_results if res['price'] == other_min][0]

        record.current_lowest = lowest

        if min(best_min, other_min) > record.expectation:
            continue
        record.lowest_price = lowest
        record.lowest_info = recommend
    TrackingRecord.objects.bulk_update(records, ['current_lowest', 'lowest_price', 'lowest_info'])
    
    