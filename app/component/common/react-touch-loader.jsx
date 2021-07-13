import React from 'react';
import '../../assets/css/touch-loader.scss';
import { U } from "../../common";

const STATS = {
    init: '',
    pulling: 'pulling',
    enough: 'pulling enough',
    refreshing: 'refreshing',
    refreshed: 'refreshed',
    reset: 'reset',
    loading: 'loading'
};

export default class ReactTouchLoader extends React.Component {
    static defaultProps = {
        distanceToPull: 30,
        distanceToRefresh: 60,
        autoLoadMore: 1,
        hideFooter: false
    };
    state = {
        loaderState: STATS.init,
        pullHeight: 0,
        progressed: 0
    };

    componentDidMount() {
        window.onscroll = U.debounce(this.onScroll, 200);
        this.tloader = document.getElementsByClassName('tloader')[0];
        this.boundTop = this.tloader.getBoundingClientRect().top;
    }

    componentWillUnmount() {
        window.onscroll = null;
    }

    setInitialTouch = (touch) => {
        this.setInitialTouch = {
            clientY: touch.clientY
        };
    };

    calculateDistance = (touch) => {
        return touch.clientY - this._initialTouch.clientY;
    };

    // 拖拽的缓动公式 - easeOutSine
    easing(distance) {
        // t: current time, b: begInnIng value, c: change In value, d: duration
        var t = distance;
        var b = 0;
        var d = screen.availHeight; // 允许拖拽的最大距离
        var c = d / 2.5; // 提示标签最大有效拖拽距离
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }

    canRefresh = () => {
        //TODO 取消下拉刷新功能
        return this.props.canRefresh && this.props.onRefresh && [
            STATS.refreshing,
            STATS.loading
        ].indexOf(this.state.loaderState) < 0;
    };

    touchStart = (e) => {
        // e.preventDefault();
        if (!this.canRefresh()) {
            return;
        }
        if (e.touches.length == 1) {
            this._initialTouch = {
                clientY: e.touches[0].clientY,
                scrollTop: this.refs.panel.scrollTop
            };
        }
    };

    touchMove = (e) => {
        // 下拉时并且页面已经到顶部时
        if (!this.canRefresh()) {
            return;
        }
        var scrollTop = this.refs.panel.scrollTop;
        let top = this.refs.panel.getBoundingClientRect().top;
        var distance = this.calculateDistance(e.touches[0]);
        if (distance > 0 && scrollTop <= 0 && top > 0) {
            var pullDistance = distance - this._initialTouch.scrollTop;
            if (pullDistance < this.props.distanceToPull) {
                return;
            }
            if (pullDistance < 0) {
                // 修复webview滚动过程中touchstart时计算panel.scrollTop不准
                pullDistance = 0;
                this._initialTouch.scrollTop = distance;
            }
            var pullHeight = this.easing(pullDistance);
            if (pullHeight) {
                e.preventDefault();
            }// 减弱滚动

            this.setState({
                loaderState: pullHeight > this.props.distanceToRefresh
                    ? STATS.enough
                    : STATS.pulling,
                pullHeight: pullHeight,
                direction: 'down'
            });
        }
    };

    touchEnd = () => {
        if (!this.canRefresh()) {
            return;
        }
        var endState = {
            loaderState: STATS.reset,
            pullHeight: 0
        };

        if (this.state.loaderState == STATS.enough) {
            // refreshing
            this.setState({
                loaderState: STATS.refreshing,
                pullHeight: 0
            });

            // trigger refresh action
            this.props.onRefresh(() => {
                // resove
                this.setState({
                    loaderState: STATS.refreshed,
                    pullHeight: 0
                });
            }, () => {
                // reject
                this.setState(endState);// reset
            });
        } else {
            this.setState(endState);
        }// reset
    };

    loadMore = () => {
        this.setState({ loaderState: STATS.loading });
        this.props.onLoadMore(() => {
            // resolve
            this.setState({ loaderState: STATS.init });
        });
    };

    getScrollTopTop = () => {
        return document.documentElement.scrollTop || document.body.scrollTop;
    };

    onScroll = () => {
        if (
            this.props.autoLoadMore &&
            this.props.hasMore &&
            [
                STATS.refreshing,
                STATS.loading
            ].indexOf(this.state.loaderState) < 0
        ) {
            let panel = this.tloader;
            let scrollBottom = panel.scrollHeight - this.getScrollTopTop() - window.innerHeight - this.boundTop;
            if (scrollBottom < 100) {
                this.setState({ loaderState: STATS.loading }, this.loadMore);
            }
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.initializing < 2) {
            this.setState({
                progressed: 0 // reset progress animation state
            });
        }
    }

    animationEnd = () => {
        var newState = {};
        if (this.state.loaderState == STATS.refreshed) {
            newState.loaderState = STATS.init;
        }
        if (this.props.initializing > 1) {
            newState.progressed = 1;
        }

        this.setState(newState);
    };

    render() {
        const { className, hasMore, initializing } = this.props;
        const { loaderState, pullHeight, progressed, direction } = this.state;
        const { hideFooter } = this.props;
        let footer = hasMore ? <div className="tloader-footer">
            <div className="tloader-btn" onClick={this.loadMore} />
            <div className="tloader-loading"><i className="ui-loading" /></div>
        </div> : !hideFooter && <div className="tloader-footer">
            <div className="no-more-data">没有更多内容了</div>
        </div>;

        if (direction === 'down') {
            var style = pullHeight
                ? {
                    WebkitTransform: `translate3d(0,${pullHeight}px,0)`,
                    transform: `translate3d(0,${pullHeight}px,0)`
                }
                : null;
        }
        let progressClassName = '';
        if (!progressed) {
            if (initializing > 0) {
                progressClassName += ' tloader-progress';
            }
            if (initializing > 1) {
                progressClassName += ' ed';
            }
        }

        return (
            <div
                ref="panel"
                className={`tloader state-${loaderState} ${className} ${progressClassName}`}
                //onScroll={this.onScroll}
                onTouchMove={this.touchMove}
                onTouchStart={this.touchStart}
                onTouchEnd={this.touchEnd}
                onAnimationEnd={this.animationEnd}>

                <div className="tloader-symbol">
                    <div className="tloader-msg"><i /></div>
                    <div className="tloader-loading"><i className="ui-loading" /></div>
                </div>

                <div
                    className="tloader-body" id="tloader-body"
                    ref={this.props.wrapRef}
                    style={style}
                >{this.props.children}{footer}</div>

            </div>
        );
    }
}
