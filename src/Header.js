import React from "react";

const Header = ({ data }) => {
  return (
    <nav style={{ display: "flex", justifyContent: "space-evenly" }}>
      {data.map(({ key, name, ticker, price }) => {
        return (
          <ul key={key} style={{ listStyle: "none" }}>
            <li>
              {name} {`[${ticker}]`} : <b>{`$${price}`}</b>
            </li>
          </ul>
        );
      })}
    </nav>
  );
};

export default Header;
