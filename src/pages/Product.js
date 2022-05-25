import React from "react";
import { Container, Form, Row, Col, Card, InputGroup, FormControl, Button, Modal, FloatingLabel } from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import Barcode from "react-barcode";
import firebase from '../firebaseConfig';
import 'firebase/compat/firestore';
import "../styles/product.scss"

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

// import CurrencyFormat from 'react-currency-format';


class Product extends React.Component {

    constructor() {
        super();


        this.state = {
            handleModal: false,
            kodeBarang: '',
            size: [],
            newSize: '',
            nosize: { 'stock': 0, 'capital': 0, 'normal': 0, 'disc': 0, 'final': 0 },

            aStock: '',
            aCapital: '',
            aNormal: '',
            aDiscount: '',
            aFinal: '',

            description: '',
            title: '',

            allCategory: [],
            selectedCategory: '',
            allBrands: [],
            selectedBrand: '',

            allProducts: [],

            new: true,

            colums: [
                {
                    dataField: "id",
                    text: "Product ID",
                    sort: true
                },
                {
                    dataField: "name",
                    text: "Product",
                    sort: true
                },
                {
                    dataField: "stock",
                    text: "Stock",
                    sort: true
                },
                {
                    dataField: "brand",
                    text: "Brand",
                    sort: true
                },
                {
                    dataField: "category",
                    text: "Category",
                    sort: true
                },
                {
                    dataField: "capital",
                    text: "Capital",
                    sort: true
                },
                {
                    dataField: "normal",
                    text: "Normal",
                    sort: true
                },
                {
                    dataField: "final",
                    text: "Final",
                    sort: true
                },
                {
                    dataField: "edit",
                    text: "",
                    sort: false,
                    formatter: this.rankFormatter.bind(this),
                }
            ]
        }
    }

    componentDidMount() {
        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        db.collection('category').get().then(p => {
            const cat = [];
            p.docs.forEach(pp => {
                cat.push({ 'id': pp.data().id, 'name': pp.data().name })
            })
            this.setState({ allCategory: cat })
        })

        db.collection('brands').get().then(brand => {
            const brands = [];
            brand.docs.forEach(b => {
                brands.push({ 'id': b.data().id, 'name': b.data().name })
            })
            this.setState({ allBrands: brands })
        })

        db.collection('products').orderBy('updated', 'desc').get().then(product => {
            const products = [];
            product.docs.forEach(p => {
                var stock = 0;
                var capital = 0;
                var normal = 0;
                var final = 0;
                p.data().options.forEach(p => {

                    stock = stock + Number(p.stock);
                    capital = capital + (Number(p.capital) * Number(p.stock));
                    normal = normal + (Number(p.normal) * Number(p.stock))
                    final = final + (Number(p.final) * Number(p.stock))
                })
                products.push({ 'name': p.data().name, 'brand': p.data().brand, 'category': p.data().category, 'description': p.data().description, 'id': p.data().id, 'ket': p.data().ket, 'options': p.data().options, 'updated': p.data().updated, 'stock': stock, 'capital': capital, 'normal': normal, 'final': final })

            })

            // all total

            this.setState({ allProducts: products })
        })
    }

    refreshProduct() {
        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        db.collection('products').orderBy('updated', 'desc').get().then(product => {
            const products = [];
            product.docs.forEach(p => {
                var stock = 0;
                var capital = 0;
                var normal = 0;
                var final = 0;
                p.data().options.forEach(p => {

                    stock = stock + Number(p.stock);
                    capital = capital + (Number(p.capital) * Number(p.stock));
                    normal = normal + (Number(p.normal) * Number(p.stock))
                    final = final + (Number(p.final) * Number(p.stock))
                })
                products.push({ 'name': p.data().name, 'brand': p.data().brand, 'category': p.data().category, 'description': p.data().description, 'id': p.data().id, 'ket': p.data().ket, 'options': p.data().options, 'updated': p.data().updated, 'stock': stock, 'capital': capital, 'normal': normal, 'final': final })

            })
            this.setState({ allProducts: products })
        })
    }

    addSize() {
        var newSize = this.state.newSize;
        if (newSize !== '') {
            this.state.size.push({ 'size': newSize, 'stock': 0, 'capital': 0, 'normal': 0, 'disc': 0, 'final': 0 })

        }
        this.setState({ newSize: '' })
    }

    removeSize(s) {
        this.setState({ size: this.state.size.filter((_, i) => i !== s) })
    }

    submit() {
        var kodeBarang = this.state.kodeBarang;
        if (kodeBarang !== '') {

            var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');

            db.collection('products').doc(kodeBarang).get().then((snap) => {
                if (snap.exists) {
                    this.setState({ new: false });
                    var data = snap.data()
                    this.setState({
                        title: data.name,
                        description: data.description,
                        selectedBrand: data.brand,
                        selectedCategory: data.category,
                    })
                    if (data.ket === 'havesize') {
                        this.setState({ size: data.options })
                    } else {
                        this.setState({ size: [], nosize: data.options })
                    }
                    this.setState({ handleModal: true })
                } else {
                    this.setState({ handleModal: true })
                }
            })
        }
    }

    delete(id) {
        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        db.collection('products').doc(id).delete().then(() => {
            this.refreshProduct()
            alert('Succesfully Deleted !!!');

        }).catch((error) => {
            alert("Error removing document: ", error)
        })
    }

    rankFormatter(cell, row) {
        return (
            <FaTrash row={row} onClick={() => window.confirm('Are you sure?',) && this.delete(row.id)} />
        )
    }



    handleHide() {
        this.setState({ handleModal: false })
    }

    applyAll() {
        let data = this.state.size;
        data.forEach((size) => {
            size.stock = this.state.aStock;
            size.capital = this.state.aCapital;
            size.normal = this.state.aNormal;
            size.disc = this.state.aDiscount;
            size.final = this.state.aFinal;
        })
        this.setState({ size: data })
    }

    saveData() {
        var d = new Date();
        var options;
        var ket;
        if (this.state.size.length > 0) {
            ket = 'havesize';
            options = this.state.size;
        } else {
            ket = 'nosize';
            options = [this.state.nosize];
        }

        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        if (this.state.new === false) {
            db.collection('products').doc(this.state.kodeBarang).update({
                id: this.state.kodeBarang,
                name: this.state.title,
                category: this.state.selectedCategory,
                brand: this.state.selectedBrand,
                description: this.state.description,
                ket: ket,
                options: options
            })
        } else {
            db.collection('products').doc(this.state.kodeBarang).set({
                id: this.state.kodeBarang,
                name: this.state.title,
                category: this.state.selectedCategory,
                brand: this.state.selectedBrand,
                description: this.state.description,
                ket: ket,
                options: options,
                updated: d.getTime()
            })
        }

        this.setState({ kodeBarang: '' });
        this.handleHide();
        alert("saved !!!");
        this.refreshProduct();
    }

    rowEvents = {
        onDoubleClick: (e, row, rowIndex) => {
            var kodeBarang = row.id
            this.setState({ kodeBarang: kodeBarang });
            this.setState({ new: false })

            var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
            db.collection('products').doc(kodeBarang).get().then((snap) => {

                var data = snap.data()
                this.setState({
                    title: data.name,
                    description: data.description,
                    selectedBrand: data.brand,
                    selectedCategory: data.category,
                })
                if (data.ket === 'havesize') {
                    this.setState({ size: data.options })
                } else {

                    this.setState({ size: [], nosize: data.options[0] })
                    console.log(this.state.nosize)
                    console.log(this.state.size)
                }
                this.setState({ handleModal: true })

            })
        }
    };

    render() {
        var qty = 0;
        var capital = 0;
        var normal = 0;
        var final = 0;

        this.state.allProducts.forEach(p => {
            qty = qty + Number(p.stock)
            capital = capital + Number(p.capital)
            normal = normal + Number(p.normal)
            final = final + Number(p.final)
        })


        return (
            <>
                <Container>


                    <Card className="mt-3">
                        <Card.Body>
                            <Row>
                                <Col xs={8}>
                                    <FormControl
                                        placeholder="Barcode Number"
                                        value={this.state.kodeBarang} autoFocus
                                        onChange={e => this.setState({ kodeBarang: e.target.value })}
                                        aria-label="Barcode Number"
                                        aria-describedby="basic-addon2"
                                    />
                                </Col>
                                <Col xs={4} className="d-grid gap-2">
                                    <Button onClick={() => this.submit()} variant="dark">Submit</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mt-3">
                        <Card.Body>
                            <Row>
                                <Col md={{ span: 3 }}>
                                    <Form.Select as="select" value={this.state.selectedCategory} aria-label="Default select example" onChange={e => this.setState({ selectedCategory: e.target.value })}>
                                        <option value="">All Categories</option>
                                        {this.state.allCategory.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}


                                    </Form.Select>
                                </Col>

                                <Col md={{ span: 3 }}>
                                    <Form.Select aria-label="Default select example" as="select" onChange={e => this.setState({ selectedBrand: e.target.value })} value={this.state.selectedBrand}>
                                        <option>All Brand</option>
                                        {this.state.allBrands.map(b => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}

                                    </Form.Select>
                                </Col>

                                <Col md={{ span: 6 }}>
                                    <InputGroup >
                                        <FormControl
                                            placeholder="Recipient's username"
                                            aria-label="Recipient's username"
                                            aria-describedby="basic-addon2"
                                        />
                                        <Button variant="dark" id="button-addon2">
                                            <FaSearch></FaSearch>
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mt-3">
                        <Card.Body>
                            <Row>
                                <Col>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="QTY">
                                        <Form.Control className=" float-end text-end" type="number" value={qty} size="lg" />
                                    </FloatingLabel>
                                </Col>
                                <Col>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="CAPITAL">
                                        <Form.Control className=" float-end text-end" type="number" value={capital} size="lg" />
                                    </FloatingLabel>
                                </Col>
                                <Col>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="NORMAL SELLING PRICE">
                                        <Form.Control className=" float-end text-end" type="number" value={normal} size="lg" />
                                    </FloatingLabel>
                                </Col>
                                <Col>
                                    <FloatingLabel
                                        controlId="floatingInput"
                                        label="FINAL SELLING PRICE">
                                        <Form.Control className=" float-end text-end" type="number" value={final} size="lg" />
                                    </FloatingLabel>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="data">
                        <BootstrapTable
                            pagination={paginationFactory({ sizePerPage: 12, paginationSize: 2, showTotal: true, hideSizePerPage: true })}
                            bootstrap4
                            keyField="id"
                            data={this.state.allProducts}
                            columns={this.state.colums}
                            condensed
                            bordered={false}
                            striped
                            wrapperClasses="table-responsive mt-3"
                            rowEvents={this.rowEvents}
                        />
                    </div>




                </Container>



                <Modal size="lg" show={this.state.handleModal} onHide={() => this.handleHide()} aria-labelledby="contained-modal-title-vcenter" centered
                >

                    <Modal.Body>
                        <Container>
                            <Card className="mt-3">
                                <Card.Body>
                                    <div md={12} className="text-center" style={{ transform: [{ scale: 0.5 }] }}> <Barcode value={this.state.kodeBarang} format="CODE128" height={30} background="transparent" /> </div>
                                </Card.Body>
                            </Card>
                            <Card className="mt-3">
                                <Card.Body>
                                    <Form>

                                        <Form.Group as={Row} className="mb-3" controlId="formNamaBarang">
                                            <Form.Label column sm="3">
                                                Product Name
                                            </Form.Label>
                                            <Col sm="9">
                                                <Form.Control type="text" placeholder="Title" value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3" controlId="formNamaBarang">
                                            <Form.Label column sm="3">
                                                Description
                                            </Form.Label>
                                            <Col sm="9">
                                                <Form.Control as="textarea" rows={3} placeholder="Product Description" value={this.state.description} onChange={e => this.setState({ description: e.target.value })} />
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3" controlId="formNamaBarang">
                                            <Form.Label column sm="3">
                                                Category
                                            </Form.Label>

                                            <Col sm="9">
                                                <Form.Select as="select" value={this.state.selectedCategory} aria-label="Default select example" onChange={e => this.setState({ selectedCategory: e.target.value })}>
                                                    <option value="">All Categories</option>
                                                    {this.state.allCategory.map(c => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </Col>

                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3" controlId="formNamaBarang">
                                            <Form.Label column sm="3">
                                                Brand
                                            </Form.Label>
                                            <Col sm="9">
                                                <Form.Select aria-label="Default select example" as="select" onChange={e => this.setState({ selectedBrand: e.target.value })} value={this.state.selectedBrand}>
                                                    <option>All Brand</option>
                                                    {this.state.allBrands.map(b => (
                                                        <option key={b.id} value={b.name}>{b.name}</option>
                                                    ))}

                                                </Form.Select>
                                            </Col>
                                        </Form.Group>

                                        <Form.Group as={Row} className="mb-3" controlId="formNamaBarang">
                                            <Form.Label column sm="3">
                                                Size
                                            </Form.Label>
                                            <Col sm="9" as={Row}>
                                                {this.state.size.map((size, i) => (
                                                    <Col xs={4} md={3} key={i}>
                                                        <InputGroup size="sm">
                                                            <FormControl
                                                                aria-label="size"
                                                                defaultValue={size.size}
                                                                aria-describedby="basic-addon2"
                                                            />
                                                            <Button variant="light" id="button-addon2" className="bg-transparent" onClick={() => this.removeSize(i)}
                                                                style={{
                                                                    marginLeft: '0px',
                                                                    zIndex: '1000'

                                                                }}>
                                                                <FaTrash></FaTrash>
                                                            </Button>
                                                        </InputGroup>
                                                    </Col>
                                                ))}


                                                <Col xs={4} md={3}>
                                                    <InputGroup size="sm">
                                                        <FormControl
                                                            value={this.state.newSize}
                                                            placeholder="new"
                                                            aria-label="size"
                                                            onChange={e => this.setState({ newSize: e.target.value })}
                                                            aria-describedby="basic-addon2"
                                                        />
                                                        <Button variant="dark" id="button-addon2" onClick={() => this.addSize()}>
                                                            <FaPlus></FaPlus>
                                                        </Button>
                                                    </InputGroup>
                                                </Col>
                                            </Col>
                                        </Form.Group>


                                    </Form>
                                </Card.Body>
                            </Card>


                            <Card className="mt-3">
                                <Card.Body>
                                    {this.state.size.length <= 0 ?
                                        <>
                                            <Row>
                                                <Col xs={2}>
                                                    <h6>Stock</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Capital</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Normal</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Disc (%)</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Final</h6>
                                                </Col>
                                            </Row>
                                            <hr></hr>
                                            <Row className="mt-2">
                                                <Col xs={2}>
                                                    <FormControl
                                                        defaultValue={this.state.nosize.stock}
                                                        type="number"
                                                        onChange={e => {
                                                            let data = this.state.nosize;
                                                            data.stock = e.target.value;
                                                            this.setState({ nosize: data })
                                                        }}
                                                        size="sm"
                                                        aria-label="size"
                                                        placeholder="amount"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        defaultValue={this.state.nosize.capital}
                                                        type="number"
                                                        onChange={e => {
                                                            let data = this.state.nosize;
                                                            data.capital = e.target.value;
                                                            this.setState({ nosize: data })
                                                        }}
                                                        size="sm"
                                                        aria-label="size"
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        defaultValue={this.state.nosize.normal}
                                                        type="number"
                                                        onChange={e => {
                                                            let data = this.state.nosize;
                                                            data.normal = e.target.value;
                                                            this.setState({ nosize: data })
                                                        }}
                                                        size="sm"
                                                        aria-label="size"
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        value={this.state.nosize.disc}
                                                        type="number"
                                                        onChange={e => {
                                                            let data = this.state.nosize;
                                                            if (data.normal !== '') {
                                                                let finalPrice = data.normal - (e.target.value / 100 * data.normal);
                                                                data.final = finalPrice;
                                                                data.disc = e.target.value;
                                                                this.setState({ nosize: data })
                                                            } else {
                                                                alert('please fill the normal price first !!!')
                                                            }
                                                        }}
                                                        size="sm"
                                                        aria-label="size"
                                                        placeholder="percent"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        value={this.state.nosize.final}
                                                        type="number"
                                                        onChange={e => {
                                                            let data = this.state.nosize;
                                                            if (data.normal !== '') {
                                                                let discount = (data.normal - e.target.value) / data.normal * 100

                                                                data.disc = discount.toFixed(2)
                                                                data.final = e.target.value;
                                                                this.setState({ nosize: data })
                                                            } else {
                                                                alert('please fill the normal price first !!!')
                                                            }

                                                        }}
                                                        size="sm"
                                                        aria-label="size"
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>

                                                </Col>
                                            </Row>

                                        </>
                                        : null}

                                    {/* ketika ada ukuran */}

                                    {this.state.size.length > 0 ?
                                        <>
                                            <Row>
                                                <Col xs={2}>
                                                    <h6>Size</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Stock</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Capital</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Normal</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Disc (%)</h6>
                                                </Col>
                                                <Col xs={2}>
                                                    <h6>Final</h6>
                                                </Col>
                                            </Row>
                                            <hr></hr>
                                            <Row className="mt-2">
                                                <Col xs={2} className="d-grid gap-2">
                                                    <Button size="sm" variant="dark" onClick={() => this.applyAll()}>Apply All</Button>
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        aria-label="size"
                                                        value={this.state.aStock}
                                                        onChange={e => this.setState({ aStock: e.target.value })}
                                                        placeholder="amount"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        aria-label="size"
                                                        value={this.state.aCapital}
                                                        onChange={e => this.setState({ aCapital: e.target.value })}
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        value={this.state.aNormal}
                                                        onChange={e => this.setState({ aNormal: e.target.value })}
                                                        aria-label="size"
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        value={this.state.aDiscount}
                                                        onChange={e => {
                                                            if (this.state.aNormal !== '') {
                                                                let finalPrice = this.state.aNormal - (e.target.value / 100 * this.state.aNormal);
                                                                this.setState({ aDiscount: e.target.value, aFinal: finalPrice })
                                                            } else {
                                                                alert('please fill normal price first !!!')
                                                            }

                                                        }}
                                                        aria-label="size"
                                                        placeholder="percent"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>
                                                    <FormControl
                                                        size="sm"
                                                        type="number"
                                                        value={this.state.aFinal}
                                                        onChange={e => {
                                                            if (this.state.aNormal !== '') {
                                                                let discount = (this.state.aNormal - e.target.value) / this.state.aNormal * 100;
                                                                this.setState({ aDiscount: discount, aFinal: e.target.value })
                                                            } else {
                                                                alert('please fill normal price first !!!')
                                                            }
                                                        }}
                                                        aria-label="size"
                                                        placeholder="price"
                                                        aria-describedby="basic-addon2"
                                                    />
                                                </Col>
                                                <Col xs={2}>

                                                </Col>
                                            </Row>

                                            {this.state.size.map((size, i) => (
                                                <Row className="mt-2" key={i}>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            aria-label="size"
                                                            value={size.size}
                                                            aria-describedby="basic-addon2"
                                                            readOnly />
                                                    </Col>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            type="number"
                                                            value={size.stock}
                                                            onChange={e => {
                                                                let data = this.state.size;
                                                                data[i].stock = e.target.value
                                                                this.setState({ size: data })
                                                            }
                                                            }
                                                            aria-label="size"
                                                            placeholder="amount"
                                                            aria-describedby="basic-addon2"
                                                        />
                                                    </Col>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            type="number"
                                                            value={size.capital}
                                                            onChange={e => {
                                                                let data = this.state.size;
                                                                data[i].capital = e.target.value
                                                                this.setState({ size: data })
                                                            }
                                                            }
                                                            aria-label="size"
                                                            placeholder="price"
                                                            aria-describedby="basic-addon2"
                                                        />
                                                    </Col>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            type="number"
                                                            value={size.normal}
                                                            onChange={e => {
                                                                let data = this.state.size;
                                                                data[i].normal = e.target.value
                                                                this.setState({ size: data })
                                                            }
                                                            }
                                                            aria-label="size"
                                                            placeholder="price"
                                                            aria-describedby="basic-addon2"
                                                        />
                                                    </Col>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            value={size.disc}
                                                            onChange={e => {
                                                                let data = this.state.size;
                                                                if (data[i].normal !== '') {
                                                                    let finalPrice = data[i].normal - (e.target.value / 100 * data[i].normal);
                                                                    data[i].disc = e.target.value
                                                                    data[i].final = finalPrice
                                                                    this.setState({ size: data })
                                                                } else {
                                                                    alert('please fill the normal price of size ' + data[i].size + ' first !!!')
                                                                }
                                                            }}
                                                            type="number"
                                                            aria-label="size"
                                                            placeholder="percent"
                                                            aria-describedby="basic-addon2"
                                                        />
                                                    </Col>
                                                    <Col xs={2}>
                                                        <FormControl
                                                            size="sm"
                                                            type="number"
                                                            value={size.final}
                                                            onChange={e => {
                                                                let data = this.state.size;
                                                                if (data[i].normal !== '') {
                                                                    let discount = (data[i].normal - e.target.value) / data[i].normal * 100;
                                                                    data[i].disc = discount.toFixed(2);
                                                                    data[i].final = e.target.value
                                                                    this.setState({ size: data })
                                                                } else {
                                                                    alert('please fill the normal price of size ' + data[i].size + ' first !!!')
                                                                }

                                                            }
                                                            }
                                                            aria-label="size"
                                                            placeholder="price"
                                                            aria-describedby="basic-addon2"
                                                        />
                                                    </Col>
                                                    <Col xs={2}>

                                                    </Col>
                                                </Row>
                                            ))}

                                        </>
                                        : null}



                                </Card.Body>
                            </Card>


                            <Card className="mt-3">
                                <Card.Body>
                                    <div className="d-grid gap-2">
                                        <Button variant="dark" onClick={() => this.saveData()}>Save Changes</Button>
                                    </div>
                                </Card.Body>
                            </Card>

                        </Container>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}
export default Product;