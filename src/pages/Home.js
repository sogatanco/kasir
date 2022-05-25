import React from 'react';
import { Button, Container, Row, Col, Card, FormControl, Form, FloatingLabel, Modal } from 'react-bootstrap';
import "../styles/Home.scss"
import firebase from '../firebaseConfig';
import 'firebase/compat/firestore';

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import { queryByTitle } from '@testing-library/react';

class Home extends React.Component {
    constructor() {
        super();

        this.state = {
            chart: [],
            availableSize: [],
            modalsize: false,
            barcode: '',
            selectedProduct: '',

            total: 0,
            qty: 0,
            total_normal: 0,
            plus_diskon: 0,
            pay: '',
            change: '',
            mustpay: '',
            tes:'aku',
            idtr:0,



            modalCheckout: false,

            colums: [
                {
                    dataField: "id",
                    text: "Product ID",
                    sort: true
                },
                {
                    dataField: "size",
                    text: "Size",
                    sort: true
                },
                {
                    dataField: "amount",
                    text: "Amount",
                    sort: true
                },
                {
                    dataField: "normal",
                    text: "Normal Price",
                    sort: true
                },
                {
                    dataField: "final",
                    text: "After Discount",
                    sort: true
                },
                {
                    dataField: "total",
                    text: "Sub total",
                    sort: true
                }
            ]
        }
    }

    closeModalCO() {
        this.setState({ modalCheckout: false })
    }


    closeModalSize() {
        this.setState({ barcode: '', modalsize: false, selectedProduct: '' })
    }

    updateStock(value, size, amount) {
        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        var data;
        if (size === 'all-size') {
            data = db.collection('products').doc(value).get().then((p) => {
                var data = p.data()
                data.options[0].stock = Number(data.options[0].stock) - amount
                return data;
            })
        } else {
            data = db.collection('products').doc(value).get().then((p) => {
                var data = p.data()
                var index = p.data().options.findIndex((s) => s.size === size)
                data.options[index].stock = Number(data.options[index].stock) - amount
                return data;
            })
        }
        data.then(p => {
            db.collection('products').doc(value).set(p)
        })
    }

    checkProduct(value) {
        this.setState({ barcode: value })
        if (value !== '') {
            var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
            db.collection('products').doc(value).get().then((snap) => {
                if (snap.exists) {
                    var data = snap.data();
                    if (data.ket === 'havesize') {
                        var sizesfilter = data.options.filter(s => Number(s.stock) > 0)
                        if (this.state.chart.length > 0) {
                            var d = sizesfilter;
                            d.forEach(a => {
                                var l = this.state.chart.filter(c => c.id === data.id && c.size === a.size)
                                // console.log(l.length)
                                if (l.length > 0) {
                                    if (Number(a.stock) <= l[0].amount) {
                                        sizesfilter = sizesfilter.filter(s => s.size !== a.size)
                                    }
                                }

                            })

                        }

                        if (sizesfilter.length > 0) {
                            this.setState({ availableSize: sizesfilter, modalsize: true, selectedProduct: data })
                        } else {
                            alert('Out of stock !!!')
                            this.setState({ barcode: '' })
                        }

                    } else {
                        var chart = this.state.chart;
                        if (Number(data.options[0].stock) > 0) {
                            if (chart.length <= 0) {
                                chart.push({ 'id': data.id, 'size': 'all-size', 'normal': data.options[0].normal, 'final': data.options[0].final, 'amount': 1, 'key': data.id + '-' + data.options[0].size, 'total': 1 * data.options[0].final, 'total_normal': 1 * data.options[0].normal })
                            } else {
                                var newA = chart.filter((a) => {
                                    return a.id === data.id
                                })
                                if (newA.length > 0) {
                                    var i = chart
                                        .findIndex(a => a.id === data.id);

                                    if (Number(data.options[0].stock) > chart[i].amount) {
                                        var jml = chart[i].amount + 1;
                                        chart.splice(i, 1);

                                        chart.push({ 'id': data.id, 'size': 'all-size', 'normal': data.options[0].normal, 'final': data.options[0].final, 'amount': jml, 'key': data.id + '-' + data.options[0].size, 'total': jml * data.options[0].final, 'total_normal': jml * data.options[0].normal })
                                    } else {
                                        alert('Out of stock !!!')
                                        this.setState({ barcode: '' })
                                    }


                                } else {
                                    chart.push({ 'id': data.id, 'size': 'all-size', 'normal': data.options[0].normal, 'final': data.options[0].final, 'amount': 1, 'key': data.id + '-' + data.options[0].size, 'total': 1 * data.options[0].final, 'total_normal': 1 * data.options[0].normal })
                                }
                            }

                            var total = 0;
                            var qty = 0;
                            var normal = 0;
                            chart.forEach(a => {
                                normal = normal + Number(a.total_normal);
                                total = total + Number(a.total);
                                qty = qty + Number(a.amount)

                            })
                            this.setState({ chart: chart, total: total, qty: qty, barcode: '', total_normal: normal })

                        } else {
                            alert('Out of stock !!!')
                            this.setState({ barcode: '' })
                        }

                    }

                } else {
                    alert('Product not registered !!!')
                }
            })
        }

    }

    afterSelectSize(value) {
        var chart = this.state.chart;
        var option = this.state.availableSize[value]


        if (chart.length <= 0) {
            chart.push({ 'id': this.state.selectedProduct.id, 'name': this.state.selectedProduct.name, 'size': option.size, 'normal': option.normal, 'final': option.final, 'amount': 1, 'key': this.state.selectedProduct.id + '-' + option.size, 'total': 1 * option.final, 'total_normal': 1 * option.normal })


        } else {
            var newA = chart.filter((a) => {
                return a.id === this.state.selectedProduct.id &&
                    a.size === option.size
            })
            if (newA.length > 0) {
                var i = chart
                    .findIndex(a => a.id === this.state.selectedProduct.id &&
                        a.size === option.size)
                var jml = chart[i].amount + 1
                chart.splice(i, 1)
                chart.push({ 'id': this.state.selectedProduct.id,'name': this.state.selectedProduct.name, 'size': option.size, 'normal': option.normal, 'final': option.final, 'amount': jml, 'key': this.state.selectedProduct.id + '-' + option.size, 'total': jml * option.final, 'total_normal': jml * option.normal })
            } else {
                chart.push({ 'id': this.state.selectedProduct.id,'name': this.state.selectedProduct.name, 'size': option.size, 'normal': option.normal, 'final': option.final, 'amount': 1, 'key': this.state.selectedProduct.id + '-' + option.size, 'total': 1 * option.final, 'total_normal': 1 * option.normal })
            }

        }
        var total = 0;
        var qty = 0;
        var normal = 0;
        chart.forEach(a => {
            normal = normal + Number(a.total_normal);
            total = total + Number(a.total);
            qty = qty + Number(a.amount)

        })
        this.setState({ chart: chart, total: total, qty: qty, total_normal: normal })

        this.closeModalSize()
    }


    checkOut() {
        if (this.state.chart.length > 0) {
            var d = new Date();
            var id='172'+d.getTime();
            this.setState({idtr:id ,modalCheckout: true, mustpay: Number(this.state.total) - Number(this.state.plus_diskon), pay: '', change: '' })
        } else {
            alert("Chart is empty !!!")
        }


    }

    saveTransactions() {
        var d = new Date();
        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        var tr = db.collection('transactions').doc(this.state.idtr)
        tr.set({
            'id': this.state.idtr,
            'time': d.getTime(),
            'qty': this.state.qty,
            'total_normal': this.state.total_normal,
            'total': this.state.total,
            'plus_discount': this.state.plus_diskon,
            'mustpay': this.state.mustpay,
            'pay': this.state.pay,
            'change': this.state.change,
            'cart': this.state.chart
        }).then(
            this.closeModalCO()
        )
       
        
    }

    finish() {
        if (Number(this.state.pay) <= 0 || Number(this.state.change) < 0) {
            alert('Payment not enough !!!')
        } else {
            this.state.chart.forEach((a) => {
                this.updateStock(a.id, a.size, a.amount)
                this.saveTransactions()
                this.print()
                this.setState({chart:[], qty:0, total:0, plus_diskon:0})
            })
        }

    }

    print(){
        const today = Date.now();
        var qty=this.state.qty;
        var subtotal=this.state.total;
        var total=this.state.mustpay;
        var disc=this.state.plus_diskon;
        var pay=this.state.pay;
        var change=this.state.change;
        var idtr=this.state.idtr;

        var p=this.state.chart
        console.log(p)
        window.JSPM.JSPrintManager.auto_reconnect = true;
        window.JSPM.JSPrintManager.start();
       
        window.JSPM.JSPrintManager.WS.onStatusChanged = function () {
            if (window.JSPM.JSPrintManager.websocket_status === window.JSPM.WSStatus.Open) {
                var cpj = new window.JSPM.ClientPrintJob();
                cpj.clientPrinter = new window.JSPM.DefaultPrinter();
    
        
            var esc = '\x1B'; //ESC byte in hex notation
            var newLine = '\x0A'; //LF byte in hex notation
        
            var cmds = esc + "@"; //Initializes the printer (ESC @)
            cmds += newLine + newLine;
            cmds += esc + '!' + '\x18'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
            cmds += '\t\tILEVEN DISTRO & CLOTHING\t\t'; //text to print
            cmds += newLine;
            cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
            cmds += '\tGampong Pineung - Banda Aceh\t'; //text to print
            cmds += newLine;
            cmds += '\t\t\t\tWA:0852-7726-3690\t\t \n \t\t\t\tIG:@ileven_distro\t\t'; //text to print
            cmds += newLine;
            cmds += newLine;
            cmds += '\t\t'+new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(today)+'\t\t'; //text to print
            cmds += newLine;
            cmds += newLine;
            cmds += '================================'; //text to print
            cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
            for(var i=0;i<p.length;i++){
                cmds += newLine;
                cmds +=p[i].name+' - '+ p[i].size;
                cmds += newLine;
                cmds += '                  x'+p[i].amount+'    @'+p[i].final; 
                cmds += newLine;
            }
            cmds += '================================'; //text to print
            cmds += newLine + newLine;
            cmds += '================================'; //text to print
            cmds += newLine;
            cmds += esc + '!' + '\x08'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
            
            cmds += 'QTY                   '+qty+' items';
            cmds += newLine;
            cmds += 'SUBTOTAL              RP '+subtotal;
            cmds += newLine;
            cmds += 'DISCOUNT             -RP '+disc;
            cmds += newLine;
            cmds += newLine;
            cmds += 'TOTAL                 RP '+total;
            cmds += newLine;
            cmds += 'PAY                   RP '+pay;
            cmds += newLine;
            cmds += 'CHANGE                RP '+change;
            cmds += newLine;
            cmds += esc + '!' + '\x00'; 
            cmds += '================================'; //text to print
            cmds += newLine + newLine;
            cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
            cmds += 'EXCHANGE WITHIN 2 DAYS WITH THE'; //text to print
            cmds += newLine;
            cmds += 'RECEIPT NO REFUND FOR ALL ITEMS.'; //text to print
            cmds += newLine;
            cmds += '\t\t\t\t\t\tTHANK YOU\t\t\t\t\t\t'; //text to print
            cmds += newLine+newLine;
            cmds += esc + '!' + '\x05'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
            cmds += '-----------ID :'+idtr+'-----------'; //text to print
            cmds += newLine;
            cmds += newLine;
            cmds += newLine;
            cmds += newLine;
            cmds += newLine;
            cmds += '.....';

            cpj.printerCommands = cmds;
            //Send print job to printer!
            cpj.sendToClient();
            }
        };
    }




    componentDidMount() {

       

    }


    render() {


        return (
            <>
                <Container>

                    <Row className="fixed-bottom mb-4">
                        <Col md={{ span: 10, offset: 2 }}>
                            <Card className="co">
                                <Card.Body style={{ display: "flex" }}  >
                                    <Button variant="dark" size="lg" style={{ marginLeft: "auto" }} onClick={() => this.checkOut()}>Check Out - - - - - &gt;&gt;&gt; </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>


                    <Row>
                        <Col md={7} className="mb-3">
                            <Card>
                                <Card.Body>
                                    <FormControl
                                        placeholder="Barcode Number"
                                        autoFocus
                                        aria-label="Barcode Number"
                                        aria-describedby="basic-addon2"
                                        size="lg"
                                        value={this.state.barcode}
                                        onChange={e => this.checkProduct(e.target.value.trim())}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={5} className="mb-3">
                            <Card>
                                <Card.Body>
                                    <Row className="mb-0">
                                        <Col xs={3}>
                                            <FloatingLabel
                                                controlId="floatingInput"
                                                label="QTY">
                                                <Form.Control className=" float-end text-end" type="number" value={this.state.qty} size="lg" />
                                            </FloatingLabel>
                                        </Col>
                                        <Col xs={9}>
                                            <FloatingLabel
                                                controlId="floatingInput"
                                                label="TOTAL">
                                                <Form.Control type="number" className=" float-end text-end" value={this.state.total} size="lg" />
                                            </FloatingLabel>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className="data">
                                <BootstrapTable
                                    bootstrap4
                                    keyField="key"
                                    data={this.state.chart}
                                    columns={this.state.colums}
                                    condensed
                                    bordered={false}
                                    striped
                                    wrapperClasses="table-responsive mt-3"
                                    rowEvents={this.rowEvents}
                                />
                            </div>
                        </Col>
                    </Row>

                </Container>



                {/* modal size */}

                <Modal show={this.state.modalsize} onHide={() => this.closeModalSize()} centered>
                    <Modal.Body>

                        <Form.Select aria-label="Default select example" as="select" defaultValue="" onChange={(e) => this.afterSelectSize(e.target.value)}>
                            <option value="">Choose size . . . . . .</option>
                            {this.state.availableSize.map((b, i) => (
                                <option key={b.size} value={i}>{b.size}</option>
                            ))}

                        </Form.Select>
                    </Modal.Body>
                </Modal>


                {/* modal checkout calculator */}
                <Modal show={this.state.modalCheckout} onHide={() => this.closeModalCO()} centered>
                    <Modal.Body>

                        <h4 className="mt-3">Shopping Total</h4>
                        <hr></hr>
                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingqty"
                                    label="QTY">
                                    <Form.Control className=" float-end text-end" type="number" value={this.state.qty} size="lg" />
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingnormal"
                                    label="TOTAL">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.total_normal} size="lg" style={{ textDecoration: 'line-through' }} />
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingtotal"
                                    label="TOTAL FINAL">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.total} size="lg" />

                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingtotal"
                                    label="+ DISCOUNT">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.plus_diskon} size="lg" onChange={e => {
                                        var disc = e.target.value;
                                        if (disc > (10 / 100 * Number(this.state.total))) {
                                            alert('max discount IDR ' + (10 / 100 * Number(this.state.total)).toFixed(0))
                                        } else {
                                            this.setState({ plus_diskon: disc, mustpay: Number(this.state.total) - Number(disc), change: Number(this.state.pay) - (Number(this.state.total) - Number(disc)) })
                                        }
                                    }} />

                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingtotal"
                                    label="MUST PAY">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.mustpay} size="lg" />

                                </FloatingLabel>
                            </Col>
                        </Row>

                        <h4 className="mt-3">Cash</h4>
                        <hr></hr>

                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingtotal"
                                    label="PAY">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.pay} size="lg"
                                        onChange={e => this.setState({ pay: e.target.value, change: Number(e.target.value) - Number(this.state.mustpay) })} />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col>
                                <FloatingLabel
                                    controlId="floatingtotal"
                                    label="CHANGE">
                                    <Form.Control type="number" className=" float-end text-end" value={this.state.change} size="lg" />

                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col>
                                <div className="d-grid gap-2">
                                    <Button variant='dark' size='lg' onClick={() => this.finish()}>FINISH</Button>
                                </div>

                            </Col>
                        </Row>

                    </Modal.Body>
                </Modal>

            </>
        )
    }
}

export default Home;