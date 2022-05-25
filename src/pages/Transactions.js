import React from "react";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import firebase from '../firebaseConfig';
import 'firebase/compat/firestore';
import "../styles/product.scss"

class Transactions extends React.Component {
    constructor() {
        super();

        this.state = {
            alltransactions: [],
            colums: [
                {
                    dataField: "time",
                    text: "Time",
                    sort: true
                },
                {
                    dataField: "qty",
                    text: "amount",
                    sort: true
                },
                {
                    dataField: "total",
                    text: "total",
                    sort: true
                },
                

            ]
            
        }
    }

    componentDidMount() {

        var db = firebase.firestore().collection('data').doc('bSn0qLmcL8fmYIbkw5t1gMXOGLg2');
        db.collection('transactions').orderBy('time', 'desc').get().then(tr => {
            var trs = [];
            tr.docs.forEach(t => {
                trs.push({ 'id': t.data().id, 'total': t.data().total, 'qty':t.data().qty, 'time':new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(t.data().time)})
            })
            this.setState({ alltransactions: trs })
        })

    }

    render() {
        console.log(this.state.alltransactions)
        return (
            <>
                <div className="data">
                    <BootstrapTable
                         pagination={paginationFactory({ sizePerPage: 12, paginationSize: 2, showTotal: true, hideSizePerPage: true })}
                        bootstrap4
                        keyField="id"
                        data={this.state.alltransactions}
                        columns={this.state.colums}
                        bordered={false}
                    />
                </div>
            </>
        )
    }
}

export default Transactions;