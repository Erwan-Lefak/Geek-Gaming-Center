/**
 * Booking Service - Geek Gaming Center
 * Service pour gérer les réservations avec validation atomique
 */
/**
 * Créer une réservation avec validation atomique
 */
export declare function createBooking(data: {
    customer_id: string;
    customer_email: string;
    customer_name: string;
    customer_phone?: string;
    slots: Array<{
        resource_id: string;
        start_time: Date;
        end_time: Date;
    }>;
    notes?: string;
}): Promise<{
    id: any;
    customer_id: string;
    customer_email: string;
    customer_name: string;
    customer_phone: string | null;
    slots: any[];
    total_price: number;
    deposit_amount: number;
    status: string;
}>;
/**
 * Confirmer une réservation après paiement
 */
export declare function confirmBooking(bookingId: string, paymentIntentId: string): Promise<{
    id: string;
    status: string;
}>;
/**
 * Annuler une réservation avec compensation
 */
export declare function cancelBooking(bookingId: string, reason?: string): Promise<{
    id: string;
    status: string;
}>;
/**
 * Récupérer une réservation par ID
 */
export declare function getBooking(id: string): Promise<any>;
/**
 * Récupérer les disponibilités pour une période
 */
export declare function getAvailability(params: {
    resource_ids?: string[];
    resource_types?: string[];
    start_date: string;
    end_date: string;
    duration?: number;
}): Promise<any[]>;
//# sourceMappingURL=booking.service.d.ts.map