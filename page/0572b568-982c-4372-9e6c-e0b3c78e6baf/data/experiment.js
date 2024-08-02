/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


function error(msg) {
    is(msg, "String") || error(`msg is not a string. msg = ${msg}`);
    throw new Error(msg);
}

function is(x, type) {
    if (Array.isArray(type)) {
        const [op, ...types] = type;
        if (op === "or") {
            return types.some((type) => is(x, type));
        } else {
            error(`Unexpected type ${type}`);
        }
    } else if (type === "Null") {
        return x === null;
    } else if (type === "String") {
        return typeof x === "string";
    } else if (type === "Nat") {
        return Number.isInteger(x) && x >= 0;
    } else if (type === "HTMLCanvas") {
        return x instanceof Node && x.tagName === "CANVAS";
    } else if (type === "Canvas") {
        return x instanceof CanvasRenderingContext2D;
    } else if (type === "Type") {
        return x instanceof Function;
    } else if (type instanceof Function) {
        return x instanceof type;
    } else {
        error(`Unexpected type. type = ${type}`);
    }
}

function check(x, type, pred = (x) => true) {
    is(x, type) || error(`x has not the type ${type}. x = ${x}`);
    pred(x) || error(`x does not verify pred. x = ${x}`);
}

class Struct {}

class Message extends Struct {
    #address;
    #content;

    constructor(address, content) {
        super();
        this.#address = address;
        this.#content = content;
    }

    get address() {
        return this.#address;
    }

    get content() {
        return this.#content;
    }

    toString() {
        return `Struct.Message(address=${this.#address} content=${this.#content})`;
    }
}

async function send(message) {
    try {
        const result = await message.address.behaviour(message.content);
        if (result === undefined) {
            return ACK;
        } else {
            return result;
        }
    } catch (error) {
        return error;
    }
}

class Actor {
    #subscribers;

    constructor() {
        this.#subscribers = [];
    }

    add_subscriber(actor) {
        this.#subscribers.push(actor);
    }

    publish_msg(msg) {
        check(msg, "String")
        this.#subscribers.forEach((actor) => actor.log(msg))
    }
}

class Account extends Actor {
    #amount;

    constructor(amount) {
        super()
        this.#amount = amount;
        this.publish_msg(`${this} has been created.`)
    }

    deposit(amount) {
        check(amount, "Nat")
        this.#amount += amount
        this.publish_msg(`${this} has just received ${amount}€.`)
    }

    toString() {
        return `Account(amount=${this.#amount})`
    }
}


class Client extends Actor {
    #account;
    #cash

    constructor(cash, account) {
        super()
        this.#cash = cash;
        this.#account = account;
        this.publish_msg(`${this} has been created.`)
    }

    deposit(amount) {
        check(amount, "Nat")
        if (amount <= this.#cash) {
            this.#cash -= amount;
            this.publish_msg(`${this} has just made a deposit of ${amount}€.`)
            this.#account.deposit(amount)
        }
        else {
            error(`I cannot transfert more cash to my account than I have.`)
        }
    }
    toString() {
        return `Client(cash=${this.#cash})`
    }
}


class TUI extends Actor {
    #el;

    constructor(el) {
        super()
        this.#el = el;
        this.log(`Textual interface is started.`)
    }

    log(msg) {
        this.#el.innerText += `\n${msg}`
    }

    observe(actor) {
        actor.add_subscriber(this);
    }
}


function run() {
    const msg = document.getElementById("msg");
    const tui = new TUI(msg);
    const account = new Account(0);
    tui.log(`${account} has been created.`)
    tui.observe(account)
    const client = new Client(100, account);
    tui.log(`${client} has been created.`)
    tui.log(`${client} has the account: ${account}.`)
    tui.observe(client)
    client.deposit(60)
}

window.experiment = { run: () => run() }
