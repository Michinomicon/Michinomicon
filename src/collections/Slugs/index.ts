import { hasAccess } from "@/utilities/accessFunctions";
import { CollectionConfig } from "payload";

export const Slugs: CollectionConfig = {
    slug: "slugs",
    access: {
        read: hasAccess("slugs", "read"),
        create: hasAccess("slugs", "create"),
        update: hasAccess("slugs", "upd"),
        delete: hasAccess("slugs", "del"),
    },
    admin: {
        useAsTitle: "slug",
        group: "Admin"
    },
    fields: [
        {
            type: "text",
            name: "slug",
            label: "Slug",
            unique: true
        },
        {
            type: "text",
            name: "display",
            label: "Display name"
        },
        {
            type: "checkbox",
            name: "active",
            label: "Active?"
        }
    ]
}