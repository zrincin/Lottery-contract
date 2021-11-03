import React, { useState, useEffect } from "react";
import web3 from "./web3";
import lottery from "./lottery";
import { Button, ButtonContent, Input, Icon } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

const App = () => {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [noOfPlayers, setNoOfPlayers] = useState(0);
  const [balance, setBalance] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [lastWinner, setLastWinner] = useState("");
  const [loadingBtn1, setLoadingBtn1] = useState(false);
  const [loadingBtn2, setLoadingBtn2] = useState(false);
  const [disabledInput, setDisabledInput] = useState(false);

  useEffect(() => {
    const getInfo = async () => {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const noOfPlayers = await lottery.methods.noOfPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const lastWinner = await lottery.methods.lastWinner().call();

      setManager(manager);
      setPlayers(players);
      setNoOfPlayers(noOfPlayers);
      setBalance(balance);
      setLastWinner(lastWinner);
    };

    getInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!value) {
      setMessage(
        "Please enter the amount of Ether you wish to send (must be greater than 0.)"
      );
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      return;
    }

    const accounts = await web3.eth.getAccounts();
    setMessage("Waiting on transaction to complete...");
    setLoadingBtn1(true);
    setDisabledInput(true);

    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, "ether"),
      });
      setMessage("You're now entered!");
    } catch (error) {
      setMessage("You declined to enter or amount too low. Please try again.");
    }

    setLoadingBtn1(false);
    setDisabledInput(true);
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const handleClick = async (e) => {
    const accounts = await web3.eth.getAccounts();
    setMessage("Picking a winner...");
    setLoadingBtn2(true);

    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      const winner = await lottery.methods.lastWinner().call();
      setMessage(`Winner chosen! ${winner} has won.`);
    } catch (error) {
      setMessage(
        "Either you're not the manager, or you declined the transaction."
      );
    }

    setLoadingBtn2(false);
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  return (
    <div class="container">
      <h1>
        <b>
          <u>LOTTERY</u>
        </b>
      </h1>
      <div>
        <ul style={{ listStyle: "square" }}>
          <li>
            <p>
              This contract is managed by <b> {manager} </b>
            </p>
          </li>
          <li>
            <p>
              There are currently <b>{noOfPlayers} persons</b> entered competing
              to win
              <b> {web3.utils.fromWei(balance, "ether")} Ether </b>(
              <b>{players.length} transactions</b> made in total)
            </p>
          </li>
          <li>
            <p>
              Last winner was <b> {lastWinner} </b>
            </p>
          </li>
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <h3>Try your luck!</h3>
        <div>
          <Input
            label="ETH"
            labelPosition="right"
            disabled={disabledInput}
            placeholder="Enter amount in Ether"
            size="small"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <h5>(min amount = 0.01 ETH)</h5>
        </div>
        <Button
          primary
          loading={loadingBtn1}
          animated="vertical"
          style={{ marginTop: 10 }}
        >
          <ButtonContent hidden>
            <Icon name="play" />
          </ButtonContent>
          <ButtonContent visible>Enter</ButtonContent>
        </Button>
      </form>
      <h3>Ready to pick a winner?</h3>
      <Button
        animated="fade"
        color="red"
        loading={loadingBtn2}
        onClick={handleClick}
      >
        <ButtonContent visible> Only manager </ButtonContent>
        <ButtonContent hidden> Pick a winner </ButtonContent>
      </Button>
      <h1>{message}</h1>
      <br />
      <br />
      <br />
      <br />
      <br />
      <footer
        style={{
          backgroundColor: "#728DB9",
          position: "fixed",
          width: "100%",
          left: 0,
          bottom: 0,
          marginTop: "100px",
        }}
      >
        <div style={{ textAlign: "center" }}>&copy; ZrinCin, 2021. </div>
      </footer>
    </div>
  );
};

export default App;
