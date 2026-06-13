import keygen from "./keygen.js";
import { getLicenseMachines, daysUntil, merchantOf } from "./machines.js";

export async function gatherLicenses(api_key) {
    const products = await keygen.getProducts(api_key);
    const rows = [];

    for (const product of products) {
        const licenses = await keygen.getLicenses(api_key, product.id);
        product.total = licenses.length;
        product.active = licenses.filter((l) => l.attributes.status === "ACTIVE").length;

        for (const license of licenses) {
            const machines = await getLicenseMachines(api_key, license.id);

            rows.push({
                id: license.id,
                key: license.attributes.key,
                status: license.attributes.status,
                created: license.attributes.created,
                expiry: license.attributes.expiry,
                days: daysUntil(license.attributes.expiry),
                product: product.attributes.name,
                merchant: merchantOf(machines),
            });
        }
    }

    return { products, rows };
}

export function summarise(rows, products) {
    return {
        products: products.length,
        licenses: rows.length,
        active: rows.filter((r) => r.status === "ACTIVE").length,
        expiring: rows.filter((r) => r.days !== null && r.days >= 0 && r.days <= 30).length,
    };
}
