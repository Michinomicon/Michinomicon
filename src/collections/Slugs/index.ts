import { CollectionConfig } from "payload";

export const Slugs: CollectionConfig = {
    slug: "slugs",
    admin: {
        useAsTitle: "slug",
        group: "Globals"
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