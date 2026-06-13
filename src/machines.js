const ACCOUNT = process.env.KEYGEN_ACCOUNT_ID;
const BASE = process.env.KEYGEN_BASE_URL;

export async function getLicenseMachines(api_key, license_id) {
    const url = `${BASE}/v1/accounts/${ACCOUNT}/licenses/${license_id}/machines`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${api_key}`,
                Accept: "application/vnd.api+json",
            },
        });

        if (!res.ok) {
            return [];
        }

        const body = await res.json();
        return Array.isArray(body.data) ? body.data : [];
    } catch (e) {
        return [];
    }
}

export async function getMachine(api_key, machine_id) {
    const url = `${BASE}/v1/accounts/${ACCOUNT}/machines/${machine_id}`;

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${api_key}`,
                Accept: "application/vnd.api+json",
            },
        });

        if (!res.ok) {
            return null;
        }

        const body = await res.json();
        return body.data || null;
    } catch (e) {
        return null;
    }
}

export async function deleteMachine(api_key, machine_id) {
    const url = `${BASE}/v1/accounts/${ACCOUNT}/machines/${machine_id}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${api_key}`,
            Accept: "application/vnd.api+json",
        },
    });

    return res.ok;
}

export function daysUntil(expiry) {
    if (!expiry) {
        return null;
    }

    const ts = Date.parse(expiry);
    if (Number.isNaN(ts)) {
        return null;
    }

    return Math.floor((ts - Date.now()) / 86400000);
}

export function merchantOf(machines) {
    const machine = machines && machines.length ? machines[0] : null;
    const meta = machine && machine.attributes && machine.attributes.metadata
        ? machine.attributes.metadata
        : {};

    return {
        domain: machine && machine.attributes ? (machine.attributes.fingerprint || "") : "",
        store: meta.store || "",
        owner: meta.owner || "",
        email: meta.email || "",
        telephone: meta.telephone || "",
        address: meta.address || "",
        url: meta.url || "",
        platform: meta.platform || "",
        count: machines ? machines.length : 0,
    };
}
