import type { CollectionConfig } from "payload";

import { authenticated } from "../../access/authenticated";
import { hasAccess } from "@/utilities/accessFunctions";

export const Users: CollectionConfig = {
    slug: "users",
    access: {
        admin: authenticated,
        create: hasAccess("users", "create"),
        delete: hasAccess("users", "del"),
        read: hasAccess("users", "read"),
        update: hasAccess("users", "upd"),
    },
    admin: {
        defaultColumns: ["name", "email"],
        useAsTitle: "name",
		group: "Admin",
    },
    auth: true,
	defaultPopulate: {
		name: true,
		admin: true,
		role: true,
	},
    fields: [
        {
            name: "name",
            type: "text",
        },
        {
            name: "admin",
            label: "Admin?",
            type: "checkbox",
        },
        {
            name: "role",
            label: "Role",
            type: "relationship",
            relationTo: "rights",
            hasMany: false,
        },
    ],
    timestamps: true,
};
