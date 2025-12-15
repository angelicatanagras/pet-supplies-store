import { IOrder } from '@/models/Order';

export interface OrderListProps {
  orders: IOrder[];
  onOrderClick: (order: IOrder) => void;
}

export interface OrderDetailsProps {
  order: IOrder | null;
}
