/*!
 * This file is part of `components` module. 
 * 
 * Authors:
 *      jason <jasonsoop@gmail.com>
 * 
 * Licensed under the MIT License.
 * Copyright (C) 2010-2017 Flagwind Inc. All rights reserved. 
 */

import loadMore from "./load-more";

const components =
{
    "i-load-more": loadMore
};

// tslint:disable-next-line:variable-name
const install = function(Vue: any, opts: any = {})
{
    Object.keys(components).forEach(key =>
    {
        Vue.component(key, components[key]);
    });
};

export default { ...components, install };
