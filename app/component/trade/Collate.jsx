import React from 'react';
import '../../assets/css/trade/collate.scss';
import classnames from 'classnames';
import { App, CTYPE, U, Utils, OSSWrap } from '../../common';
import { CollateCarts } from '../Comps';
import { Toast, Icon } from 'antd-mobile';
import { Spin, Input, Button } from 'antd';
import TradeUtils from './TradeUtils';



export default class Collate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tradeId: this.props.match.params.tradeId,
            trade: {},
        }
    }

    componentDidMount() {
        U.setWXTitle('订单详情');
        this.loadTrade();
        this.loadCategories();
        Utils.addr.loadRegion(this);
    }

    loadTrade = () => {
        let { tradeId } = this.state;
        App.api('recy/trade/trade', { tradeId }).then(trade => {
            this.setState({ trade });
        });
    }

    loadCategories = () => {
        App.api('recy/category/categories').then(categories => {
            this.setState({ categories });
        });
    }

    getCartsCategoryNum = (carts = []) => {
        let { categories = [] } = this.state;
        let objs = [];

        carts.map(cart => {
            let _sequence = cart.sequence.substr(0, 2) + '0000';
            let category = categories.find(it => it.sequence == _sequence) || {};
            let { name, priority } = category;
            if (!U.str.isEmpty(name)) {
                if (objs.findIndex(it => it.name == name) < 0) {
                    objs.push({ name, priority });
                }
            }
        });

        return objs.length;
    }

    handleNewImage = e => {

        let { uploading = false, imgs = [], } = this.state;


        let img = e.target.files[0];

        if (!e.target.files[0] || !(e.target.files[0].type.indexOf('jpg') > 0 || e.target.files[0].type.indexOf('png') > 0 || e.target.files[0].type.indexOf('jpeg') > 0)) {
            Toast.error('文件类型不正确,请选择图片类型');
            this.setState({
                uploading: false,
            });
            return;
        }
        if (uploading) {
            Toast.loading('上传中');
            return;
        }
        this.setState({ uploading: true });
        OSSWrap.upload(img).then((result) => {
            imgs.push(result.url);
            this.setState({
                imgs,
                uploading: false,
            });

        }).catch((err) => {
            imgs.error(err);
        });
    };

    render() {

        let { tradeId, trade = {}, categories = [], uploading = false } = this.state;
        let { carts = [], imgs = [] } = trade;

        return <div className="collate-page">
            <div className="top-bar">
                <div className="num">共 {this.getCartsCategoryNum(carts)}种 {carts.length}件</div>
                <div className="btn-add" onClick={() => {
                    TradeUtils.renderCartEdit(categories, trade);
                }}>+ 添加物品</div>
            </div>

            <CollateCarts carts={carts} categories={categories} />

            <div className="wrap">
                <div className="title">备注</div>
                <Input.TextArea maxLength={150} placeholder="请描述回收信息" onChange={(e) => {
                    this.setState({
                        recyCancelMark: e.target.value,
                    });
                }} />
            </div>

            <div className="wrap">
                <div className="title">上传图片</div>

                <div className="upload-wrapper">
                    <Spin spinning={uploading}>
                        {imgs.map((img, index) => {
                            return <div key={index} className="upload-img" loading={uploading.toString()}>
                                <Icon type="cross-circle-o" onClick={() => {
                                    imgs.splice(imgs.findIndex((it, i, arr) => i == index), 1);
                                    this.setState({
                                        imgs
                                    })
                                }} />
                                {img && <img key={index} src={img} style={{ width: '68px', height: '68px', cursor: 'pointer' }} onClick={() => {
                                    Utils.common.showImgLightbox(imgs, index);
                                }} />}
                            </div>
                        })}
                        <div className='upload-img-tip'>
                            <Button type="primary" >
                                <span>拍照上传</span>
                                <input className="file" type='file' onChange={this.handleNewImage} />
                            </Button>
                        </div>
                    </Spin>
                </div>

                <div className="clear"></div>

            </div>

            <div className="footer">
                <div className="total">
                    <div className=""></div>
                </div>
                <div className="btn">提交订单</div>
            </div>

        </div>
    }
}