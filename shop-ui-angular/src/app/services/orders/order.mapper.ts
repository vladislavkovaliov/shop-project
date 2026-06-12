import { Order } from "@app/models/order.types";
import { DtoListOrderResponse, DtoOrderResponse } from "src/lib/types/api";

export function mapOrder(rawOrder: DtoOrderResponse): Order {
    return {
        id: rawOrder.id.toString(),
        userId: rawOrder.user_id,
        createdAt: rawOrder.created_at,
    };
}

export function mapOrders(rawOrders: DtoListOrderResponse["data"]): Order[] {
    return rawOrders.map(mapOrder);
}