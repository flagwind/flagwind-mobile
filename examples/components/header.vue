<template>
    <div class="u-header">
        flag-wind-wap
    </div>
</template>

<script lang="ts">

import { component, Component } from "src/index";

/**
 * 表示一个公共头部组件。
 * @class
 * @version 1.0.0
 */
@component
export default class Header extends Component
{
    protected activePath: string = "";
    
    /**
     * 创建组件时调用的钩子方法。
     * @protected
     * @returns void
     */
    protected mounted(): void
    {
        // let rootPath = this.$route.matched && this.$route.matched[0].path;
        
        // this.$store.dispatch("setRoutePath", rootPath);
    }
    
    /**
     * 当选择菜单项时候调用。
     * @private
     * @param  {string} path 菜单路径。
     */
    protected onMenuSelect(path: string)
    {
        if(path !== this.$route.path)
        {
            // 设置根路由
            this.$store.dispatch("setRoutePath", path);

            // 跳转路由
            this.$router.push(path);
        }
    }
}
</script>
