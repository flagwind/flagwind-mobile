/*!
 * Authors:
 *      jason <jasonsoop@gmail.com>
 * 
 * Licensed under the MIT License.
 * Copyright (C) 2010-2017 Flagwind Inc. All rights reserved. 
 */

import GenericLayout from "../layouts/generic.vue";
import ContentLayout from "../layouts/content.vue";

import IntroView from "../views/intro.vue";
import ColorView from "../views/color.vue";

const routes =
[
    {
        path: "/",
        redirect: "overview"
    },
    {
        path: "/overview",
        component: GenericLayout,
        meta:
        {
            title: "概览",
            icon: "pie-graph"
        },
        children:
        [
            {
                path: "",
                component: IntroView
            }
        ]
    }
];

export default routes;
