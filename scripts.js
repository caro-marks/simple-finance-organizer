const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active do modal
        document
            .querySelector(".modal-overlay")
            .classList.add('active')
    },
    close() {
        //Fechar modal
        // Remover a class active do modal
        document
            .querySelector(".modal-overlay")
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("finances.app:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("finances.app:transactions",
            JSON.stringify(transactions))
    }
}

const Transaction = {

    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DocObjMod = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DocObjMod.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DocObjMod.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}> ${amount}</td>
            <td class="description"> ${transaction.kind}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" style="max-width: 1.5rem;" src="./assets/minus.svg" alt="">
            </td>`

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DocObjMod.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    kind: document.querySelector('select#kind'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            kind: Form.kind.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, kind, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || kind.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields() // validação dos campos
            const transaction = Form.formatValues() // formatação dos dados
            Transaction.add(transaction) // salvando a transação
            Form.clearFields() // limpando os campos
            Modal.close() // fechando o campo
        } catch (error) {
            alert(error.message)
        }


    }
}


const App = {
    init() {
        Transaction.all.forEach(DocObjMod.addTransaction)

        DocObjMod.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DocObjMod.clearTransactions()

        App.init()
    }
}

App.init()

// [
//     {
//         description: 'Energia elétrica',
//         amount: -50000,
//         kind: 'Moradia',
//         date: '11/11/2011'
//     },
//     {
//         description: 'Aluguel Pelotas',
//         amount: 500000,
//         kind: 'Renda',
//         date: '10/10/2010'
//     },
//     {
//         description: 'Freela',
//         amount: 30000,
//         kind: 'Salário',
//         date: '12/12/2012'
//     }
// ],
