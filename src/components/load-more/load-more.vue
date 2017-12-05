<template>
   <div class="flagwind-loadmore">
       <div class="loadmore-content" :class="{ 'is-dropped': topDropped || bottomDropped }" :style="{ transform: 'translate3d(0,' + translate + 'px, 0)' }">
            <!-- 下拉顶部 BEGIN -->
            <slot name="top">
                <div class="loadmore-top" v-if="topMethod">
                    <span class="loadmore-text">{{ topText }}</span>
                </div>
            </slot>
            <!-- 下拉顶部 END -->
            
            <slot></slot>

            <!-- 上拉底部 END -->
            <slot name="bottom">
                <div class="loadmore-bottom" v-if="bottomMethod && !bottomAllLoaded">
                    <span v-if="bottomStatus === 'loading'" class="loadmore-loading-spainer mr10"></span>
                    <span class="loadmore-text">{{ bottomText }}</span>
                </div>
            </slot>
            <!-- 上拉底部 END -->
        </div>
   </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

/**
 * 加载更多组件。
 * @class
 * @version 1.0.0
 * @description 移植自mint-ui 用法参考http://mint-ui.github.io/docs/#/zh-cn2/loadmore
 */

@Component
export default class LoadMore extends Vue 
{
    private translate: number = 0;                  // 滑动的距离 
    private scrollEventTarget: any = null;          // touchmove event对象
    private containerFilled: boolean = false;       // 首页内容是否已经填满
    private topText: string = "";                   // topStatus 为 pull 时加载提示区域的文字
    private topDropped: boolean = false;            // topStatus 为 drop 时加载提示区域的文字
    private bottomText: string = "";                // bottomStatus 为 pull 时加载提示区域的文字
    private bottomDropped: boolean = false;         // bottomStatus 为 pull 时加载提示区域的文字
    private bottomReached: boolean = false;
    private direction: string = "";                 // 方向
    private startY: number = 0;                     // touch起点Y
    private startScrollTop: number = 0;
    private currentY: number = 0;
    private topStatus: string = "";                 // 顶部状态
    private bottomStatus: string = "";              // 底部状态
   
 
    @Prop({ default: 0 })
    maxDistance: number;                    // 组件可移动的最大距离（像素），若为 0 则不限制

    @Prop({ default: true })
    autoFill: boolean;                      // 若为真，loadmore 会自动检测并撑满其容器

    @Prop({ default: 2 })
    distanceIndex: number;                  // 手指移动与组件移动距离的比值

    @Prop({ default: "下拉刷新" })
    topPullText: string;                    // topStatus 为 pull 时加载提示区域的文字

    @Prop({ default: "释放更新" })
    topDropText: string;                    // topStatus 为 drop 时加载提示区域的文字
    
    @Prop({ default: "加载中..." })
    topLoadingText: string;                 // topStatus 为 loading 时加载提示区域的文字

    @Prop({ default: 70 })
    topDistance: number;                    // 触发 topMethod 的下拉距离阈值（像素）

    @Prop()
    topMethod: Function;                    // 下拉刷新执行的方法

    @Prop({ default: "上拉刷新" })
    bottomPullText: string;                 // bottomStatus 为 pull 时加载提示区域的文字

    @Prop({ default: "释放更新" })
    bottomDropText: string;                 // bottomStatus 为 drop 时加载提示区域的文字

    @Prop({ default: "努力加载中..." })
    bottomLoadingText: string;              // bottomStatus 为 loading 时加载提示区域的文字

    @Prop({ default: 70 })
    bottomDistance: number;                 // 触发 bottomMethod 的上拉距离阈值（像素）

    @Prop()
    bottomMethod: Function;                 // 上拉刷新执行的方法

    @Prop({ default: false })
    bottomAllLoaded: boolean;               // 若为真，则 bottomMethod 不会被再次触发

    @Watch("topStatus")
    onTopStatusChange(val: string)
    {
        this.$emit("top-status-change", val);

        switch(val)
        {
            case "pull":
                this.topText = this.topPullText;
                break;
            case "drop":
                this.topText = this.topDropText;
                break;
            case "loading":
                this.topText = this.topLoadingText;
                break;
        }
    }
    
    @Watch("bottomStatus")
    onBottomStatusChange(val: string)
    {
        this.$emit("bottom-status-change", val);

        switch(val)
        {
            case "pull":
                this.bottomText = this.bottomPullText;
                break;
            case "drop":
                this.bottomText = this.bottomDropText;
                break;
            case "loading":
                this.bottomText = this.bottomLoadingText;
                break;
        }
    }

    protected mounted() 
    {
        this.init();
    }

    /**
     * 初始化方法。
     * @private
     * @returns void
     */
    private init(): void
    {
        this.topStatus = "pull";
        this.bottomStatus = "pull";
        this.topText = this.topPullText;
        this.scrollEventTarget = this.getScrollEventTarget(this.$el);

        if(typeof this.bottomMethod === "function")
        {
            this.fillContainer();
            this.bindTouchEvents();
        }
        if(typeof this.topMethod === "function")
        {
            this.bindTouchEvents();
        }
    }

    /**
     * 在父组件调用的下拉刷新完成方法，标识数据已经加载完成去掉加载动画。
     * @public 
     * @returns void
     */
    public onTopLoaded(): void
    {
        this.translate = 0;

        setTimeout(() =>
        {
            this.topStatus = "pull";
        }, 200);
    }

    /**
     * 在父组件调用的上拉加载完成方法，标识数据已经加载完成去掉加载动画。
     * @public 
     * @returns void
     */
    public onBottomLoaded(): void
    {
        this.bottomStatus = "pull";
        this.bottomDropped = false;

        this.$nextTick(() =>
        {
            if(this.scrollEventTarget === window)
            {
                document.body.scrollTop += 50;
            }
            else
            {
                this.scrollEventTarget.scrollTop += 50;
            }

            this.translate = 0;
        });

        if(!this.bottomAllLoaded && !this.containerFilled)
        {
            this.fillContainer();
        }
    }

    /**
     * 获取滑动的对象
     * @private
     * @param {any} element 标签对象
     * @returns any
     */
    private getScrollEventTarget(element: any): any
    {
        let currentNode = element;

        while(currentNode && currentNode.tagName !== "HTML" && currentNode.tagName !== "BODY" && currentNode.nodeType === 1)
        {
            let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;

            if(overflowY === "scroll" || overflowY === "auto")
            {
                return currentNode;
            }

            currentNode = currentNode.parentNode;
        }

        return window;
    }

    /**
     * 获取当前视口与顶部的距离。
     * @private
     * @param {any} element elme对象
     * @returns number
     */
    private getScrollTop(element: any): number
    {
        if(element === window)
        {
            return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
        }
        else
        {
            return element.scrollTop;
        }
    }

    /**
     * 初始化绑定事件。
     * @private
     * @returns void
     */
    private bindTouchEvents(): void
    {
        this.$el.addEventListener("touchstart", this.handleTouchStart);
        this.$el.addEventListener("touchmove", this.handleTouchMove);
        this.$el.addEventListener("touchend", this.handleTouchEnd);
    }

    /**
     * 如果当前列表数据不满一页，自动触发加载方法来填充。
     * @private
     * @returns void
     */
    private fillContainer(): void
    {
        if(this.autoFill)
        {
            this.$nextTick(() =>
            {
                if(this.scrollEventTarget === window)
                {
                    this.containerFilled = this.$el.getBoundingClientRect().bottom >= document.documentElement.getBoundingClientRect().bottom;
                }
                else
                {
                    this.containerFilled = this.$el.getBoundingClientRect().bottom >= this.scrollEventTarget.getBoundingClientRect().bottom;
                }

                if(!this.containerFilled)
                {
                    this.bottomStatus = "loading";
                    this.bottomMethod();
                }
            });
        }
    }

    /**
     * 检测是否到达了底部。
     * @private
     * @returns boolean
     */
    private checkBottomReached(): boolean
    {
        if(this.scrollEventTarget === window)
        {
            return document.body.scrollTop + document.documentElement.clientHeight >= document.body.scrollHeight;
        }
        else
        {
            return this.$el.getBoundingClientRect().bottom <= this.scrollEventTarget.getBoundingClientRect().bottom + 1;
        }
    }

    /**
     * touchstart 触发事件
     * @param {any} event 事件对象
     * @returns void
     */
    private handleTouchStart(event: any): void
    {
        this.startY = event.touches[0].clientY;
        this.startScrollTop = this.getScrollTop(this.scrollEventTarget);
        this.bottomReached = false;

        if(this.topStatus !== "loading")
        {
            this.topStatus = "pull";
            this.topDropped = false;
        }
        if(this.bottomStatus !== "loading")
        {
            this.bottomStatus = "pull";
            this.bottomDropped = false;
        }
    }

    /**
     * touchmove 触发事件
     * @param {any} event 事件对象
     * @returns void
     */
    private handleTouchMove(event: any): void
    {
        if(this.startY < this.$el.getBoundingClientRect().top && this.startY > this.$el.getBoundingClientRect().bottom)
        {
            return;
        }

        this.currentY = event.touches[0].clientY;

        let distance = (this.currentY - this.startY) / this.distanceIndex;
        this.direction = distance > 0 ? "down" : "up";

        if(typeof this.topMethod === "function" && this.direction === "down" && this.getScrollTop(this.scrollEventTarget) === 0 && this.topStatus !== "loading")
        {
            event.preventDefault();
            event.stopPropagation();

            if(this.maxDistance > 0)
            {
                this.translate = distance <= this.maxDistance ? distance - this.startScrollTop : this.translate;
            }
            else
            {
                this.translate = distance - this.startScrollTop;
            }

            if(this.translate < 0)
            {
                this.translate = 0;
            }

            this.topStatus = this.translate >= this.topDistance ? "drop" : "pull";
        }

        if(this.direction === "up")
        {
            this.bottomReached = this.bottomReached || this.checkBottomReached();
        }

        if(typeof this.bottomMethod === "function" && this.direction === "up" && this.bottomReached && this.bottomStatus !== "loading" && !this.bottomAllLoaded)
        {
            event.preventDefault();
            event.stopPropagation();

            if(this.maxDistance > 0)
            {
                this.translate = Math.abs(distance) <= this.maxDistance ? this.getScrollTop(this.scrollEventTarget) - this.startScrollTop + distance : this.translate;
            }
            else
            {
                this.translate = this.getScrollTop(this.scrollEventTarget) - this.startScrollTop + distance;
            }

            if(this.translate > 0)
            {
                this.translate = 0;
            }

            this.bottomStatus = -this.translate >= this.bottomDistance ? "drop" : "pull";
        }

        this.$emit("translate-change", this.translate);
    }

    /**
     * touchend 触发事件
     * @param {any} event 事件对象
     * @returns void
     */
    private handleTouchEnd(): void
    {
        if(this.direction === "down" && this.getScrollTop(this.scrollEventTarget) === 0 && this.translate > 0)
        {
            this.topDropped = true;

            if(this.topStatus === "drop")
            {
                this.translate = 50;
                this.topStatus = "loading";
                this.topMethod();
            }
            else
            {
                this.translate = 0;
                this.topStatus = "pull";
            }
        }

        if(this.direction === "up" && this.bottomReached && this.translate < 0)
        {
            this.bottomDropped = true;
            this.bottomReached = false;

            if(this.bottomStatus === "drop")
            {
                this.translate = -50;
                this.bottomStatus = "loading";
                this.bottomMethod();
            }
            else
            {
                this.translate = 0;
                this.bottomStatus = "pull";
            }
        }

        this.$emit("translate-change", this.translate);
        this.direction = "";
    }
}
</script>

<style lang="less">
   @import "./style";
</style>
