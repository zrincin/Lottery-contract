export const shortenAddress = (address) => {
  if (address.length === 42) {
    return `${address?.slice(0, 7)}...${address?.slice(address.length - 5)}`;
  } else {
    return address;
  }
};
