import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, Card, Typography, Grid, TextField, Button, Select, MenuItem, Alert } from '@mui/material';
import CrossBorderPayment from './CrossBorderPayment.json'; // Your contract ABI
import './App.css'; // Import custom CSS for minor styles

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR'); // Default is INR
  const [receiver, setReceiver] = useState('');
  const [balanceINR, setBalanceINR] = useState(0);
  const [balanceBDT, setBalanceBDT] = useState(0);
  const [message, setMessage] = useState('');
  const [ethEquivalent, setEthEquivalent] = useState(0);
  const [messageType, setMessageType] = useState('info'); // info, error, success

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum); // Initialize Web3 with MetaMask
          await window.ethereum.enable(); // Request account access
          setWeb3(web3);

          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const contractAddress = '0x3aA4dbaB990312D4Ce164178bD12D54cDe30832f'; // Your deployed contract address
          const contractInstance = new web3.eth.Contract(CrossBorderPayment.abi, contractAddress);
          setContract(contractInstance);
          // 0x3aA4dbaB990312D4Ce164178bD12D54cDe30832f

          // Fetch initial balances
          await getBalances(contractInstance, accounts[0], web3);
        } else {
          alert('MetaMask is not installed. Please install it to use this app.');
        }
      } catch (error) {
        setMessage(`Error initializing Web3: ${error.message}`);
        setMessageType('error');
      }
    };

    init();
  }, []);

  // Fetch balances for INR and BDT
  const getBalances = async (contractInstance, accountAddress, web3Instance) => {
    try {
      const inrBalance = await contractInstance.methods.balances(accountAddress, web3Instance.utils.asciiToHex('INR')).call();
      const bdtBalance = await contractInstance.methods.balances(accountAddress, web3Instance.utils.asciiToHex('BDT')).call();

      setBalanceINR(web3Instance.utils.fromWei(inrBalance, 'ether'));
      setBalanceBDT(web3Instance.utils.fromWei(bdtBalance, 'ether'));
    } catch (error) {
      setMessage(`Error fetching balances: ${error.message}`);
      setMessageType('error');
    }
  };

  // Convert amount to ETH equivalent
  const getEthEquivalent = async (amount, currency) => {
    try {
      let ethPrice;
      if (currency === 'INR') {
        ethPrice = await contract.methods.getLatestETHINRPrice().call();
      } else if (currency === 'BDT') {
        ethPrice = await contract.methods.getLatestETHBDTPrice().call();
      }
      const ethEquivalent = (amount / ethPrice) * 1e8; // Convert to ETH equivalent based on rate
      setEthEquivalent(ethEquivalent.toFixed(6)); // Format to 6 decimal places
    } catch (error) {
      setMessage(`Error fetching ETH equivalent: ${error.message}`);
      setMessageType('error');
    }
  };

  // Handle deposit to the contract
  const deposit = async () => {
    if (contract && amount) {
      try {
        const weiAmount = web3.utils.toWei(ethEquivalent, 'ether');
        await contract.methods.deposit(currency).send({ from: account, value: weiAmount });
        setMessage(`Deposited ${amount} ${currency}.`);
        setMessageType('success');

        await getBalances(contract, account, web3);
      } catch (error) {
        setMessage(`Error depositing funds: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  // Handle withdrawal from the contract
  const withdraw = async () => {
    if (contract && amount) {
      try {
        await contract.methods.withdraw(web3.utils.toWei(amount, 'ether'), currency).send({ from: account });
        setMessage(`Withdrew ${amount} ${currency}.`);
        setMessageType('success');

        await getBalances(contract, account, web3); // Update balance after withdrawal
      } catch (error) {
        setMessage(`Error withdrawing funds: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  // Handle cross-border payment
  const sendCrossBorderPayment = async () => {
    if (contract && receiver && amount) {
      try {
        const weiAmount = web3.utils.toWei(ethEquivalent, 'ether');
        const toCurrency = currency === 'INR' ? 'BDT' : 'INR';
        await contract.methods.sendCrossBorderPayment(receiver, weiAmount, currency, toCurrency).send({
          from: account,
        });
        setMessage('Cross-border payment successful!');
        setMessageType('success');
        await getBalances(contract, account);  // Update balance after payment
      } catch (error) {
        setMessage(`Error sending payment: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Card style={{ padding: '20px', marginTop: '30px' }}>
        <Typography variant="h4" align='center' gutterBottom>
          Bridge Pay
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Connected Account: {account}
        </Typography>
        {message && <Alert severity={messageType} style={{ marginBottom: '20px' }}>{message}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">INR Balance: {balanceINR} INR</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">BDT Balance: {balanceBDT} BDT</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`Amount (${currency})`}
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Select
              fullWidth
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              displayEmpty
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="BDT">BDT</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Equivalent ETH: {ethEquivalent} ETH</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" fullWidth color="primary" onClick={deposit}>
              Deposit
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant="contained" fullWidth color="secondary" onClick={withdraw}>
              Withdraw
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Send Cross-Border Payment</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Receiver Address"
              variant="outlined"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" fullWidth color="primary" onClick={sendCrossBorderPayment}>
              Send Payment
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}

export default App;