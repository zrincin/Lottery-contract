import React, { Component } from 'react';
import web3 from './web3';
import lottery from './lottery';
import { Button, ButtonContent, Input, Icon } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

class App extends Component {

    state = {
        manager: '',
        players: [],
        noOfPlayers: 0,
        balance: '',
        value: '',
        message: '',
        lastWinner: '',
        loadingBtn1: false,
        loadingBtn2: false,
        disabledInput: false,
    };

    async componentDidMount() {
        const manager = await lottery.methods.manager().call();
        const players = await lottery.methods.getPlayers().call();
        const noOfPlayers = await lottery.methods.noOfPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);
        const lastWinner = await lottery.methods.lastWinner().call();

        this.setState({ manager, players, balance, lastWinner, noOfPlayers });
    }

    onSubmit = async (event) => {
        event.preventDefault();

        if ((this.state.value > 0) === false) {
            this.setState({ message: "Please enter the amount of Ether you wish to send (must be greater than 0.)" });
            setTimeout(() => { window.location.reload(); }, 3000);
            return;
        }

        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Waiting on transaction to complete..." });
        this.setState({ loadingBtn1: true });
        this.setState({ disabledInput: true });

        try {

            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether'),
            });

            this.setState({ message: "You're now entered!" });
        } catch (error) {
            this.setState({ message: "You declined to enter or amount too low. Please try again." });
        }

        this.setState({ loadingBtn1: false });
        this.setState({ disabledInput: true });
        setTimeout(() => { window.location.reload(); }, 3000);

    }

    onClick = async (event) => {

        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Picking a winner..." });
        this.setState({ loadingBtn2: true });

        try {

            await lottery.methods.pickWinner().send({ from: accounts[0] });
            const winner = await lottery.methods.lastWinner().call();
            this.setState({ message: `Winner chosen! ${winner} has won.` });
          
        } catch (error) {
            this.setState({ message: "Either you aren't the manager, or you declined the transaction." });
        }

        this.setState({ loadingBtn2: false });
        setTimeout(() => { window.location.reload(); }, 5000);
    }

    render() {
        return (
            <div style={{ backgroundColor: "#40E0D0", paddingLeft: 10, paddingTop: 10}}>
                <h1><b><u>LOTTERY CONTRACT</u></b></h1>
                <div>
                <ul style={{ listStyle: "square" }}>
                    <li>
                        <p>This contract is managed by <b>{this.state.manager}</b></p>
                    </li>
                    <li>
                        <p>There are currently <b>{ this.state.noOfPlayers } persons </b>competing to win <b>{web3.utils.fromWei(this.state.balance, 'ether')} Ether</b>  (<b>{this.state.players.length} transactions</b> in total) </p>
                    </li>
                    <li>
                        <p>Last winner was <b>{this.state.lastWinner}</b></p>
                    </li>
                </ul>
                </div>
                <hr />
                <form onSubmit={this.onSubmit}>
                    <h3>Want to try your luck?</h3>
                    <div>
                        <Input label="ETH" labelPosition="right" disabled={this.state.disabledInput}
                            placeholder="Enter amount in Ether"
                            size="small"
                            type='number'
                            value={this.state.value}
                            onChange={event => this.setState({ value: event.target.value })}
                        />
                         <h5>(min amount = 0.01 ETH)</h5>
                    </div>
                    <Button primary loading={this.state.loadingBtn1} animated="vertical" style={{ marginTop: 10 }} >
                        <ButtonContent hidden><Icon name="play" /></ButtonContent>
                        <ButtonContent visible>Enter</ButtonContent>
                    </Button>
                </form>
                <hr />
                <h3>Ready to pick a winner?</h3>
                <Button animated="fade" color="red" loading={this.state.loadingBtn2} onClick={this.onClick}>
                    <ButtonContent visible> Only manager </ButtonContent>
                    <ButtonContent hidden > Pick a winner </ButtonContent>
                </Button>
                <hr />
                <h1>{this.state.message}</h1>
                <br /><br /><br /> <br /><br />
                <footer>
                    <div style={{textAlign: "center"}}>&copy; ZrinCin, 2021. </div>
                </footer>
            </div>
        ); 

    } 
}

export default App;
