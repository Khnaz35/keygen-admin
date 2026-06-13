import keygen from "../keygen.js";
import getAPIKey from "../api_key.js";
import { getLicenseMachines, daysUntil, merchantOf } from "../machines.js";
import { gatherLicenses, summarise } from "../data.js";

export async function index(req, res) {
    const api_key = await getAPIKey();
    const products = await keygen.getProducts(api_key);

    for (const product of products) {
        const licenses = await keygen.getLicenses(api_key, product.id);
        product.total = licenses.length;
        product.active = licenses.filter((l) => l.attributes.status === "ACTIVE").length;
    }

    res.render('products', { products, title: "Products" });
}

export async function home(req, res) {
    const api_key = await getAPIKey();
    const { products, rows } = await gatherLicenses(api_key);
    const stats = summarise(rows, products);
    const recent = [...rows]
        .sort((a, b) => (a.created < b.created ? 1 : -1))
        .slice(0, 8);

    res.render('index', { products, stats, recent, title: "Dashboard" });
}

export async function handle_create(req, res) {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
        return res.render('create_product', { error: "Name is required" });
    }

    const api_key = await getAPIKey();
    const product = await keygen.createProduct(api_key, { name });
    res.redirect(`/product/${product.id}`);
}

export async function show(req, res) {
    const { product_id } = req.params;
    const api_key = await getAPIKey();
    const product = await keygen.getProduct(api_key, product_id);
    const policies = await keygen.getPolicies(api_key, product_id);
    const licenses = await keygen.getLicenses(api_key, product_id);

    for (const license of licenses) {
        const machines = await getLicenseMachines(api_key, license.id);
        license.merchant = merchantOf(machines);
        license.days = daysUntil(license.attributes.expiry);
    }

    res.render('product', { product, policies, licenses, title: product.attributes.name });
}