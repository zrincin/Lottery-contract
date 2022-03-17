import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";
import web3 from "./web3";
import lottery from "./lottery";
import { Button, ButtonContent, Input, Icon } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import axios from "axios";
import "animate.css";
import { shortenAddress } from "./utils/addressShortener";

const App = () => {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [noOfPlayers, setNoOfPlayers] = useState(0);
  const [balance, setBalance] = useState("");
  const [userBalance, setUserBalance] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [lastWinner, setLastWinner] = useState("");
  const [loadingBtn1, setLoadingBtn1] = useState(false);
  const [loadingBtn2, setLoadingBtn2] = useState(false);
  const [disabledInput, setDisabledInput] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const getInfo = async () => {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const noOfPlayers = await lottery.methods.noOfPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const lastWinner = await lottery.methods.lastWinner().call();
      const accounts = await web3.eth.getAccounts();
      const userBalance = account
        ? await web3.eth.getBalance(accounts[0])
        : "0";

      setManager(manager);
      setPlayers(players);
      setNoOfPlayers(noOfPlayers);
      setBalance(balance);
      setLastWinner(lastWinner);
      setAccount(accounts[0]);
      setUserBalance(userBalance);
    };

    getInfo();
    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts);
    });
    window.ethereum.on("chainChanged", (_) => window.location.reload());
  }, [account, userBalance]);

  const [coinData, setCoinData] = useState([]);
  // CoinPaprika API interaction
  useEffect(() => {
    const getCoins = async () => {
      const response = await axios.get("https://api.coinpaprika.com/v1/coins");
      const coinIDs = response.data.slice(0, 10).map((coin) => coin.id);
      const tickerURL = "https://api.coinpaprika.com/v1/tickers/";
      const promises = coinIDs.map((id) => axios.get(tickerURL + id));
      const coinDataAll = await Promise.all(promises);
      const newCoinData = coinDataAll.map((response) => {
        const coin = response.data;
        const price = coin.quotes.USD.price;
        return {
          key: coin.id,
          name: coin.name,
          ticker: coin.symbol,
          price: parseFloat(Number(price).toFixed(2)),
        };
      });
      setCoinData(newCoinData);
    };
    getCoins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!value) {
      setMessage(
        "Please enter the amount of Ether you wish to send (must be greater than 0)."
      );
      setTimeout(() => setMessage(""), 3000);
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
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      setMessage("You declined to enter or amount too low. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }

    setLoadingBtn1(false);
    setDisabledInput(false);
    setValue("");
  };

  const handleClick = async () => {
    const accounts = await web3.eth.getAccounts();
    setMessage("Picking a winner...");
    setLoadingBtn2(true);

    try {
      await lottery.methods.pickWinner().send({ from: accounts[0] });
      const winner = await lottery.methods.lastWinner().call();
      setMessage(`Winner chosen! ${winner} has won.`);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      setMessage(
        "Either you're not the manager, or you declined the transaction."
      );
      setTimeout(() => setMessage(""), 3000);
    }

    setLoadingBtn2(false);
  };

  return (
    <>
      <div className="container">
        <div style={{ float: "right", marginRight: 20 }}>
          {account && account.length ? (
            <div>
              <b>Connected to:</b> &nbsp;
              <span style={{ color: "wheat" }}>
                {account && shortenAddress(account)}
              </span>
              <br />
              {userBalance ? (
                <>
                  <b>Balance: </b>
                  <span style={{ color: "lemonchiffon", marginLeft: 35 }}>
                    {parseFloat(
                      web3.utils.fromWei(userBalance, "ether")
                    ).toFixed(8)}
                    &nbsp; ETH
                  </span>
                </>
              ) : (
                <div style={{ color: "yellow" }}>
                  Wrong network detected - switch to Rinkeby!
                </div>
              )}
              <hr />
            </div>
          ) : (
            <Button
              onClick={async () => {
                await window.ethereum.request({
                  method: "eth_requestAccounts",
                });
              }}
              inverted
              color="teal"
            >
              Connect Wallet
            </Button>
          )}
        </div>
        <div
          id="header"
          className="animate__animated animate__zoomIn"
          style={{ animationDuration: "2s", marginTop: 60 }}
          onClick={() => window.open("https://www.coingecko.com/")}
          title="Navigate to CoinGecko"
        >
          <Header data={coinData} />
        </div>
        <div
          id="title"
          className="animate__animated animate__lightSpeedInRight"
          style={{ color: "khaki", animationDuration: "2s", marginTop: 20 }}
        >
          <h1>
            <b>
              <u style={{ letterSpacing: 2 }}>LOTTERY</u>
              <h4 style={{ marginTop: 0 }}>
                <b> @ {lottery.options.address} (Rinkeby) </b>
              </h4>
            </b>
          </h1>
        </div>
        <div>
          <ul style={{ listStyle: "square", marginLeft: -20 }}>
            <li>
              <p>
                This contract is managed by <b> {manager} </b>
              </p>
            </li>
            <li>
              <p>
                There are currently <b>{noOfPlayers} players</b> entered
                competing to win
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
        <form style={{ marginTop: 20 }} onSubmit={handleSubmit}>
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
              title="min amount = 0.01 ETH"
            />
          </div>
          <Button
            primary
            loading={loadingBtn1}
            animated="vertical"
            style={{ marginTop: 20 }}
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
      </div>
      <Footer />
    </>
  );
};

export default App;
