import React from "react";

const Header = ({ data }) => {
  return (
    <nav>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {data
          .filter((item) => item.ticker !== "USDT" && item.ticker !== "USDC")
          .map(({ key, name, ticker, price }) => {
            return (
              <ul key={key} style={{ listStyle: "none", width: "100%" }}>
                <li>
                  {name} {`[${ticker}]`} <br /> <b>{`$${price}`}</b>
                </li>
              </ul>
            );
          })}
      </div>
    </nav>
  );
};

export default Header;
