import React, { useState } from "react";
import { ethers } from "ethers";
import diaWomenABI from "./diaWomenAbi.json";
import BigNumber from "bignumber.js";
import matict from "./matic.json";
import usdt from "./usdt.json";
import * as s from '../../styles/globalStyles'
import {
    StyledButton,
    StyledImg,
    StyledLink,
    ResponsiveWrapper,
    StyledLogo,
    StyledRoundButton,
} from "./homestyle.js";
import './Home.css';
const Home = () => {
    const [selectedOption, setSelectedOption] = useState(""); // State for selected cryptocurrency
    const [bnbCost, setBnbCost] = useState(0);
    const [claimingNft, setClaimingNft] = useState(false);
    const [walletAddress, setwalletAdress] = useState(null);
    const [mintAmount, setMintAmount] = useState(1);
    const [mintedTokens, setmintedTokens] = useState(0);
    const [ready, setready] = useState(false);
    const [networkId, setnetworkId] = useState(null);

    const bnbCon = "0x0000000000000000000000000000000000001010";
    const usdtCon = "0x69344954655aFA24f5AB6e4AaCFcDa8d20e7b2Fc";
    const maticCon = "0xb001cBFD050072961BA8565f1884BF29466A0Bbb"
    const womenCon = "0x1483C0d2D5613AcD734712a61a7eF26C7D8c49d0";

    const connectMetamask = async () => {
        if (typeof window.ethereum === "undefined") {
            throw new Error("Please install MetaMask to use this dApp!");
        }

        await window.ethereum.request({ method: "eth_accounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        const address = accounts[0];
        const network = await provider.getNetwork();
        const networkId = network.chainId;

        if (networkId == "80001") {
            const diaWomenContract = connectContract(womenCon, diaWomenABI, provider);
            const value = await diaWomenContract.totalSupply();
            const bigNum = new BigNumber(value._hex);
            const decimalValue = bigNum.toString(10);
            setBnbCost(await diaWomenContract.bnbCost());
            setmintedTokens(decimalValue);
            setwalletAdress(address);
            setnetworkId(networkId);
            setready(true);
        }
    };


    const handleSelect = (value) => {
        setSelectedOption(value);
    };

    const bnbMint = async () => {
        if (networkId == "80001") {
        const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
        );
        const signer = provider.getSigner();
        const diaWomenContract = new ethers.Contract(womenCon, diaWomenABI, signer);

        try {
            const gasLimit = 300000;
            const gasPrice = ethers.utils.parseUnits('20', 'gwei');
            // Call the ethers mint function
            const tx = await diaWomenContract.mint(mintAmount, {
                value: ethers.utils.parseEther(String(0.002 * mintAmount)),
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });
            await tx.wait();
            console.log('Mint successful');
            setmintedTokens(parseInt(mintedTokens) + parseInt(mintAmount));
            setClaimingNft(false);
        } catch (error) {
            console.error('Error minting:', error);
        }

    }
    };

    const royalMint = async () => {
        if (networkId == "80001") {
            setClaimingNft(true);

            const provider = new ethers.providers.Web3Provider(
                window.ethereum,
                "any"
            );
            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();

            try {

                const maticContract = connectContract(maticCon, matict, signer);
                console.log(maticContract);

                const diaWomenContract = new ethers.Contract(womenCon, diaWomenABI, signer);
                const gasLimit = 300000;
                const gasPrice = ethers.utils.parseUnits('20', 'gwei');
                let weiValue = new BigNumber(mintAmount * 1 * 10 ** 18);
                const tx = await maticContract.approve(womenCon, weiValue.toString());
                await tx.wait();
                console.log(tx);

                const res_tx = await diaWomenContract.royalMint(mintAmount, {
                    gasLimit: gasLimit,
                    gasPrice: gasPrice
                });
                await res_tx.wait();
                console.log('Mint successful');
                setmintedTokens(parseInt(mintedTokens) + parseInt(mintAmount));
                setClaimingNft(false);
            } catch (error) {
                console.error('Error minting:', error);
            }

        }
    };

    const usdtMint = async () => {
        if (networkId == "80001") {
            setClaimingNft(true);

            const provider = new ethers.providers.Web3Provider(
                window.ethereum,
                "any"
            );
            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();

            try {

                const usdtContract = connectContract(usdtCon, usdt, signer);
                console.log(usdtContract);

                const diaWomenContract = new ethers.Contract(womenCon, diaWomenABI, signer);
                const gasLimit = 300000;
                const gasPrice = ethers.utils.parseUnits('20', 'gwei');
                let weiValue = new BigNumber(mintAmount * 10 * 10 ** 6);
                const tx = await usdtContract.approve(womenCon, weiValue.toString());
                await tx.wait();
                console.log(tx);

                const res_tx = await diaWomenContract.usdtMint(mintAmount, {
                    gasLimit: gasLimit,
                    gasPrice: gasPrice
                });
                await res_tx.wait();
                console.log('Mint successful');
                setmintedTokens(parseInt(mintedTokens) + parseInt(mintAmount));
                setClaimingNft(false);
            } catch (error) {
                console.error('Error minting:', error);
            }

        }
    };

    // Modify the handleMint function to call the appropriate mint function based on the selected cryptocurrency
    const handleMint = async () => {
        if (!selectedOption) {
            console.error("Please select a cryptocurrency.");
            return;
        }

        switch (selectedOption) {
            case "BNB":
                await bnbMint();
                break;
            case "ROYAL":
                await royalMint();
                break;
            case "USDT":
                await usdtMint();
                break;
            default:
                console.error("Unsupported cryptocurrency:", selectedOption);
        }
    };

    const decrementMintAmount = () => {
        let newMintAmount = mintAmount - 1;
        if (newMintAmount < 1) {
            newMintAmount = 1;
        }
        setMintAmount(newMintAmount);
    };

    const incrementMintAmount = () => {
        let newMintAmount = mintAmount + 1;
        if (newMintAmount > 5) {
            newMintAmount = 5;
        }
        setMintAmount(newMintAmount);
    };


    const connectContract = (address, abi, provider) => {
        return new ethers.Contract(address, abi, provider);
    };

    return (
        <div className="home" id="home">
            <div className="homeleft">
                <img
                    className="left-img"
                    src="https://i.imgur.com/JsGCf9H.png"
                    alt=""
                />
            </div>

            <div className="homeright">
                <h2 className="home-main-title">
                    diamond <span style={{}}>woman</span>
                </h2>
                <p className="home-par">
                    <span style={{}}>
                        Limited time Community Growth Special: when prompted, set your BUSD
                        approval limit to 10 BUSD or the approval will not succeed.{" "}
                    </span>
                    Only 1 mint is allowed per transaction. Prices are subject to rise.
                    Each NFT will earn rewards from 20 #ROYALDBK tokens as well as a
                    lottery ticket. Every 250 NFTs sold will give 5 randomly selected
                    minters a 100 BUSD lottery prize.
                </p>
                <h2 className="home-short-item">
                    {mintedTokens} / 9999{" "}
                    <span style={{ color: "teal", fontWeight: "bold" }}>
                        Diamond Women
                    </span>{" "}
                    MINTED
                </h2>
              

                {ready ? (
                    
                    <>
                      <div style={{marginLeft:"auto", marginRight:"auto"}}>
                    <label htmlFor="crypto-dropdown" style ={{color:"#fff", marginLeft:"auto", marginRight:"auto"}}>Select a cryptocurrency:</label>
                    <select id="crypto-dropdown" value={selectedOption} onChange={(e) => handleSelect(e.target.value)}>
                        
                        <option value="BNB">BNB</option>
                        <option value="ROYAL">ROYAL</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>
                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                            <StyledRoundButton
                                style={{
                                    lineHeight: 0.4,
                                    color: "white",
                                    backgroundColor: "#008080",
                                }}
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    decrementMintAmount();
                                }}
                            >
                                -
                            </StyledRoundButton>
                            <s.SpacerMedium />
                            <s.TextDescription
                                style={{
                                    textAlign: "center",
                                    color: "white",
                                    
                                }}
                            >
                                {mintAmount}
                            </s.TextDescription>
                            <s.SpacerMedium />
                            <StyledRoundButton
                                style={{
                                    lineHeight: 0.4,
                                    color: "white",
                                    backgroundColor: "#008080",
                                }}
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    incrementMintAmount();
                                }}
                            >
                                +
                            </StyledRoundButton>
                        </s.Container>
                        <s.SpacerSmall />
                        <s.Container ai={"center"} jc={"center"} fd={"row"}>
                            <StyledButton
                            style={{
                                color: "white",
                                backgroundColor: "#008080",
                            }}
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMint();
                                }}
                            >
                                {claimingNft ? "BUSY" : "BUY"}
                            </StyledButton>
                        </s.Container>
                        
                    </>
                    
                ) : (
                    <>
                        <input className="connect-txt" type="text" />
                        <button
                            className="connect-txtbtn"
                            onClick={() => connectMetamask()}
                        >
                            connect
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;