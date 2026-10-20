import type { PurchaseRecord, PackingRecord, PaymentRecord, SearchFilter } from '../types/index.ts';

/**
 * Filter Purchases based on global search & filter criteria
 */
export function filterPurchases(
  records: PurchaseRecord[],
  filter: Partial<SearchFilter>
): PurchaseRecord[] {
  const query = (filter.query || '').toLowerCase().trim();
  const dateFrom = filter.dateFrom?.trim() || '';
  const dateTo = filter.dateTo?.trim() || '';
  const supplier = filter.supplier?.trim() || '';
  const shippingMark = filter.shippingMark?.trim() || '';

  return records.filter((p) => {
    // 1. Date Range
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;

    // 2. Supplier / Description Filter
    if (supplier) {
      const matchSupplier =
        p.description.toLowerCase().includes(supplier.toLowerCase()) ||
        (p.contactNumber && p.contactNumber.includes(supplier));
      if (!matchSupplier) return false;
    }

    // 3. Shipping Mark (if specified, match in remarks or invoice or description)
    if (shippingMark) {
      const matchMark =
        (p.remarks && p.remarks.toLowerCase().includes(shippingMark.toLowerCase())) ||
        p.description.toLowerCase().includes(shippingMark.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(shippingMark.toLowerCase());
      if (!matchMark) return false;
    }

    // 4. Free text query
    if (query) {
      const matchQuery =
        p.invoiceNumber.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.date.includes(query) ||
        (p.contactNumber && p.contactNumber.toLowerCase().includes(query)) ||
        (p.remarks && p.remarks.toLowerCase().includes(query)) ||
        (p.items && p.items.some((it) => it.item.toLowerCase().includes(query)));

      if (!matchQuery) return false;
    }

    return true;
  });
}

/**
 * Filter Packing lists based on global search & filter criteria
 */
export function filterPackings(
  records: PackingRecord[],
  filter: Partial<SearchFilter>
): PackingRecord[] {
  const query = (filter.query || '').toLowerCase().trim();
  const dateFrom = filter.dateFrom?.trim() || '';
  const dateTo = filter.dateTo?.trim() || '';
  const shippingMark = filter.shippingMark?.trim() || '';
  const supplier = filter.supplier?.trim() || '';
  const destination = filter.destination?.trim() || '';

  return records.filter((p) => {
    // 1. Date Range
    if (dateFrom && p.packingDate < dateFrom) return false;
    if (dateTo && p.packingDate > dateTo) return false;

    // 2. Shipping Mark
    if (shippingMark) {
      if (!p.shippingMark.toLowerCase().includes(shippingMark.toLowerCase())) {
        return false;
      }
    }

    // 3. Supplier / Shipper
    if (supplier) {
      if (!p.shipper.toLowerCase().includes(supplier.toLowerCase())) {
        return false;
      }
    }

    // 4. Destination
    if (destination) {
      if (!p.destination.toLowerCase().includes(destination.toLowerCase())) {
        return false;
      }
    }

    // 5. Free text query
    if (query) {
      const matchQuery =
        p.invoiceNumber.toLowerCase().includes(query) ||
        p.shippingMark.toLowerCase().includes(query) ||
        p.flight.toLowerCase().includes(query) ||
        p.destination.toLowerCase().includes(query) ||
        p.shipper.toLowerCase().includes(query) ||
        p.packingDate.includes(query) ||
        (p.remarks && p.remarks.toLowerCase().includes(query)) ||
        (p.items && p.items.some((it) => it.item.toLowerCase().includes(query)));

      if (!matchQuery) return false;
    }

    return true;
  });
}

/**
 * Filter Payments based on global search & filter criteria
 */
export function filterPayments(
  records: PaymentRecord[],
  filter: Partial<SearchFilter>
): PaymentRecord[] {
  const query = (filter.query || '').toLowerCase().trim();
  const dateFrom = filter.dateFrom?.trim() || '';
  const dateTo = filter.dateTo?.trim() || '';
  const supplier = filter.supplier?.trim() || '';
  const shippingMark = filter.shippingMark?.trim() || '';

  return records.filter((p) => {
    // 1. Date Range
    if (dateFrom && p.date < dateFrom) return false;
    if (dateTo && p.date > dateTo) return false;

    // 2. Supplier / Party Name
    if (supplier) {
      if (!p.description.toLowerCase().includes(supplier.toLowerCase())) {
        return false;
      }
    }

    // 3. Shipping Mark (match in linked document or particulars)
    if (shippingMark) {
      const matchDoc =
        (p.returnRmb?.linkedExportDocument &&
          p.returnRmb.linkedExportDocument.toLowerCase().includes(shippingMark.toLowerCase())) ||
        (p.items &&
          p.items.some((it) =>
            it.description.toLowerCase().includes(shippingMark.toLowerCase())
          )) ||
        (p.remarks && p.remarks.toLowerCase().includes(shippingMark.toLowerCase()));

      if (!matchDoc) return false;
    }

    // 4. Free text query
    if (query) {
      const matchQuery =
        p.invoiceNumber.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.partyType.toLowerCase().includes(query) ||
        p.date.includes(query) ||
        (p.contactNumber && p.contactNumber.toLowerCase().includes(query)) ||
        (p.remarks && p.remarks.toLowerCase().includes(query)) ||
        (p.returnRmb?.linkedExportDocument &&
          p.returnRmb.linkedExportDocument.toLowerCase().includes(query)) ||
        (p.items && p.items.some((it) => it.description.toLowerCase().includes(query)));

      if (!matchQuery) return false;
    }

    return true;
  });
}
