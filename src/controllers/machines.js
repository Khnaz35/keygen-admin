import getAPIKey from "../api_key.js";
import { getMachine, deleteMachine } from "../machines.js";

export async function handle_delete(req, res) {
    const { machine_id } = req.params;
    const api_key = await getAPIKey();

    const machine = await getMachine(api_key, machine_id);

    if (!machine) {
        return res.status(404).send("Machine not found");
    }

    const license_id = machine.relationships
        && machine.relationships.license
        && machine.relationships.license.data
        ? machine.relationships.license.data.id
        : null;

    await deleteMachine(api_key, machine_id);

    return res.redirect(license_id ? `/license/${license_id}` : "/products");
}
