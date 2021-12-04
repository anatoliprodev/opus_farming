import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Web3 from 'web3';
import Carousel from 'react-bootstrap/Carousel'
import { poolAvalanche, poolBSC } from "../data/pools";
// import Button from "../components/common/Button";
import TopBar from "../components/TopBar";
import HomeLight from "../images/home.png"
import Giveaway from "../images/giveaway.png"
import BillboardLight from "../images/billboard-light.png";
import BillboardDark from "../images/billboard-dark.png";
import { useStateValue } from "../StateProvider";
import "./styles/Home.css";
import "./styles/HomeResponsive.css";
import {CHAIN_ID_LIST, ERC20_ABI, FARMING_ABI, ROUTER_ABI} from "../config.js";

const Home = ({
  bar,
  setBar,
  showBar,
  setShowBar,
  paddingLeft,
  setPaddingLeft,
  paddingRight,
  setPaddingRight,
}) => {
  const [{ theme, walletAddr, chainInfo }] = useStateValue();

  const [pool, setPool] = useState("Avalanche");
  const [poolData, setPoolData] = useState(poolAvalanche);

  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showLpModal, setShowLpModal] = useState(false);
  const [connectedAddr, setConnectedAddr] = useState('');
  const [baseTokenInUsd, setBaseTokenInUsd] = useState(0);
  const [opusTokenInUsd, setOpusTokenInUsd] = useState(0);
  const [totalLockedOnChain, setTotallockedOnChain] = useState(0);
  const [yourAllTlvOnChain, setYourAllTlvOnChain] = useState(0);
  const [topAprFarm, setTopAprFarm] = useState({});
  const [yourTlvForTF, setYourTlvForTF] = useState(0);
  const [totalStakedToken, setTotalStakedToken] = useState(0);
  const [yourStakedToken, setYourStakedToken] = useState(0);
  const [stakingAPY, setStakingAPY] = useState(0);
  const [satkeDailyAPR, setStakeDailyAPR] = useState(0);
  const [poolInfoSelected, setPoolInfoSelected] = useState({})
  const [lpStakedCurrPool, setLpStakedCurrPool] = useState(0)
  const [opusEarned, setOpusEarned] = useState(0);
  const [pendingOpus, setPendingOpus] = useState(0);
  const [willWithdraw, setWillWithdraw] = useState(false);
  const [lpBalCurrPool, setLpBalCurrPool] = useState(0);
  const [inputDeposit, setInputDeposit] = useState(0);
  const [inputWithdraw, setInputWithdraw] = useState(0);
  const [slideTime, setSlideTime] = useState(0);

  const enterFarm = (p) => {
    refreshPoolInfo(p)
    setShowFarmModal(!showFarmModal)
  }
  const refreshPoolInfo = (p) => {
    if (walletAddr === "" || walletAddr === "Connect")
      return;

    if (!showFarmModal) {
      setPoolInfoSelected(p)
      let web3 = new Web3(window.ethereum)
      const farmContract = new web3.eth.Contract(FARMING_ABI, p.farmAddr);
      farmContract.methods.userInfo(p.pid, connectedAddr).call(
      ).then((res) => {
        let lp = Number(res.amount) / Math.pow(10, 18);
        let earned = Number(res.rewardDebt) / Math.pow(10, 18);
        setLpStakedCurrPool(lp)
        setOpusEarned(earned);
        if (lp > 0) {
          farmContract.methods.pendingOpus(p.pid, connectedAddr).call(
          ).then((pendingRes) => {
            let pending = Number(pendingRes) / Math.pow(10, 18);
            setPendingOpus(pending)
          })
        }
      })
      const lpContract = new web3.eth.Contract(ERC20_ABI, p.lpAddr);
      lpContract.methods.balanceOf(connectedAddr).call(
      ).then((lpBal) => {
        setLpBalCurrPool(Number(lpBal) / Math.pow(10, 18));
      })
    }
  };

  const enableFarming = () => {
    setShowFarmModal(!showFarmModal)
    let web3 = new Web3(window.ethereum);
    const lpContract = new web3.eth.Contract(ERC20_ABI, poolInfoSelected.lpAddr);
    const num256 = 10**30;
    const bigNumAmount = "0x"+num256.toString(16);
    lpContract.methods.approve(poolInfoSelected.farmAddr, bigNumAmount).send({ from: walletAddr })
    .then(() => {
      let pool = poolInfoSelected;
      pool.joined = true;
      setPoolInfoSelected([...pool])
    }).catch(() => {
      //alert('error')
    })
  }

  const lpMove = (isWithdraw) => {
    setShowFarmModal(!showFarmModal)
    setShowLpModal(!showLpModal)
    setWillWithdraw(isWithdraw);
  }

  const onClickMax = () => {
    if (willWithdraw) {
      setInputWithdraw(lpStakedCurrPool)
    } else {
      setInputDeposit(lpBalCurrPool)
    }
  }

  const validInput = (e) => {
    if (Number(e.target.value) < 0) {
      return;
    }
    
    console.log(e.target.value, 'sss')
    if (willWithdraw) {
      if (lpStakedCurrPool >= Number(e.target.value)) {
        setInputWithdraw(Number(e.target.value))
      } else {
        return;
      }
    } else {
      if (lpBalCurrPool >= Number(e.target.value)) {
        setInputDeposit(Number(e.target.value))
      } else {
        return;
      }
    }
  }

  const withdraw = () => {
    setShowLpModal(!showLpModal)
    let web3 = new Web3(window.ethereum)
    const farmContract = new web3.eth.Contract(FARMING_ABI, poolInfoSelected.farmAddr);
    const num256 = 10**18 * inputWithdraw;
    const bigNumAmount = "0x"+num256.toString(16);
    farmContract.methods.withdraw(poolInfoSelected.pid, bigNumAmount).send({ from: walletAddr })
    .then(() => {
      refreshPoolInfo(poolInfoSelected);
    }).catch(() => {
      //alert('error')
    })
    setInputWithdraw(0)
  }

  const deposit = () => {
    setShowLpModal(!showLpModal)
    let web3 = new Web3(window.ethereum)
    const farmContract = new web3.eth.Contract(FARMING_ABI, poolInfoSelected.farmAddr);
    const num256 = 10**18 * inputDeposit;
    const bigNumAmount = "0x"+num256.toString(16);
    farmContract.methods.deposit(poolInfoSelected.pid, bigNumAmount, "0x0000000000000000000000000000000000000000").send({ from: walletAddr })
    .then(() => {
      refreshPoolInfo(poolInfoSelected);
    }).catch(() => {
      //alert('error')
    })
    setInputDeposit(0)
  }

  const harvest = () => {
    setShowFarmModal(!showFarmModal)
    let web3 = new Web3(window.ethereum)
    const farmContract = new web3.eth.Contract(FARMING_ABI, poolInfoSelected.farmAddr);
    const num256 = 10**30;
    const bigNumAmount = "0x"+num256.toString(16);
    farmContract.methods.deposit(poolInfoSelected.pid, 0, "0x0000000000000000000000000000000000000000").send({ from: walletAddr })
    .then(() => {
      refreshPoolInfo(poolInfoSelected);
    }).catch(() => {
      //alert('error')
    })
  }

  const switchNetwork = async (chainName) => {
    if (!window.ethereum) {
      setPool(chainName);
      let pool;
      if (chainName === "BSC") {
        pool = poolBSC;
      } else if (chainName === "Avalanche") {
        pool = poolAvalanche;
      }
      setPoolData(pool);
      return;
    }

    let originParam = {};
    if (chainName === "BSC") {
      originParam = CHAIN_ID_LIST[0]  
    } else if (chainName === "Avalanche") {
      originParam = CHAIN_ID_LIST[1]
    }
    const {buyUrl, ...chainParam} = originParam

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainParam],
      });
    } catch (addError) {
      // handle "add" error
    }
  };

  function getPoolInfos(basePrice, opusPrice) {
    console.log('avalanche.....', chainInfo)
    if (chainInfo && chainInfo.chainId) {
      let selectedPools;
      if (chainInfo.chainName === "BSC") {
        selectedPools = poolBSC;
      } else if (chainInfo.chainName === "Avalanche") {
        selectedPools = poolAvalanche;
      }
      setPoolData([...selectedPools]);
      
      let web3 = new Web3(chainInfo.rpcUrls[0])
      for (let i = 1; i < selectedPools.length; i++) {
        if (selectedPools[i].token1 && selectedPools[i].token1 !== "") {
          const token1Contract = new web3.eth.Contract(ERC20_ABI, selectedPools[i].token1);
          token1Contract.methods.balanceOf(selectedPools[i].lpAddr).call(
          ).then((token1Bal) => {
            const lpContract = new web3.eth.Contract(ERC20_ABI, selectedPools[i].lpAddr);
            if (walletAddr && walletAddr !== "Connect" && walletAddr !== "" && !selectedPools[i].joined) {
              lpContract.methods.allowance(walletAddr, selectedPools[i].farmAddr).call(
              ).then((allow) => {
                if (Number(allow) > 10000000000000000000000000000) {
                  selectedPools[i].joined = true;
                  setPoolData([...selectedPools])
                }
              })
            }
            lpContract.methods.totalSupply().call(
            ).then((ts) => {
              lpContract.methods.balanceOf(selectedPools[i].farmAddr).call(
              ).then((farmLp) => {
                const share = Number(farmLp) / Number(ts);
                const routerContract = new web3.eth.Contract(ROUTER_ABI, selectedPools[i].routerAddr);
                if (selectedPools[i].token1.toLowerCase() === selectedPools[i].usdAddr.toLowerCase()) {
                  selectedPools[i].tvl = Number(token1Bal) / Math.pow(10, selectedPools[i].decimal1) * 2 * share;
                  selectedPools[i].total = (selectedPools[i].tvl) ? (selectedPools[i].totalTokenPerYear * selectedPools[i].poolWeight * opusPrice) / selectedPools[i].tvl : 0;
                  selectedPools[i].daily = selectedPools[i].total / 365;
                  setPoolData([...selectedPools])
                } else {
                  /*routerContract.methods.getAmountsOut('1000000000000000000', [selectedPools[i].baseTokenAddr, selectedPools[i].usdAddr]).call(
                  ).then((res) => {
                    const baseTokenInUsd = Number(res[1]) / Math.pow(10, selectedPools[i].usdDecimal);*/
                    if (basePrice > 0) {
                      if (selectedPools[i].token1.toLowerCase() === selectedPools[i].baseTokenAddr.toLowerCase()) {
                        selectedPools[i].tvl = Number(token1Bal) / Math.pow(10, selectedPools[i].decimal1) * basePrice * 2 * share;
                        selectedPools[i].total = (selectedPools[i].tvl) ? (selectedPools[i].totalTokenPerYear * selectedPools[i].poolWeight * opusPrice) / selectedPools[i].tvl : 0;
                        selectedPools[i].daily = selectedPools[i].total / 365;
                        setPoolData([...selectedPools])
                      } else {
                        routerContract.methods.getAmountsOut(token1Bal, [selectedPools[i].token1, selectedPools[i].baseTokenAddr]).call(
                        ).then((token1InMain) => {
                          selectedPools[i].tvl = Number(token1InMain[1]) / Math.pow(10, 18) *  basePrice * 2 * share;
                          selectedPools[i].total = (selectedPools[i].tvl) ? (selectedPools[i].totalTokenPerYear * selectedPools[i].poolWeight * opusPrice) / selectedPools[i].tvl : 0;
                          selectedPools[i].daily = selectedPools[i].total / 365;
                          setPoolData([...selectedPools])
                        }).catch((err) => {
                        });
                      }
                    }
                  /*}).catch((err) => {
                    alert(err)
                  });*/
                }
              })
            })
          })
        }       
      }
    }
  }

  useEffect(() => {
    getPoolInfos()
  }, []);

  useEffect(() => {
    setPool(chainInfo.chainName ? chainInfo.chainName : "Avalanche")
    setConnectedAddr(walletAddr);

    if (chainInfo && chainInfo.chainId) {
      let Pool;
      if (chainInfo.chainName === "BSC") {
        Pool = poolBSC;
      } else if (chainInfo.chainName === "Avalanche") {
        Pool = poolAvalanche;
      }
      let web3 = new Web3(chainInfo.rpcUrls[0])
      const routerContract = new web3.eth.Contract(ROUTER_ABI, Pool[0].routerAddr);
      routerContract.methods.getAmountsOut('1000000000000000000', [Pool[0].baseTokenAddr, Pool[0].usdAddr]).call(
      ).then((res) => {
        const basePrice = Number(res[1]) / Math.pow(10, Pool[0].usdDecimal);
        setBaseTokenInUsd(basePrice);
        console.log('base', basePrice)
        routerContract.methods.getAmountsOut('1000000000000000000', [Pool[0].token0, Pool[0].baseTokenAddr]).call(
        ).then((amount) => {
          setOpusTokenInUsd(amount[1] / Math.pow(10, 18) * basePrice)
          let opusPrice = amount[1] / Math.pow(10, 18) * basePrice
          getPoolInfos(basePrice, opusPrice)
        })
      }).catch(() => {
        setBaseTokenInUsd(0)
        setOpusTokenInUsd(0)
      })
    }
  }, [chainInfo, walletAddr])

  useEffect(() => {
    const fetchPoolInfos = setInterval(() => {
      getPoolInfos(baseTokenInUsd, opusTokenInUsd)
    }, 10000);

    function getBasicPrices() {
      if (chainInfo && chainInfo.chainId) {
        let Pool;
        if (chainInfo.chainName === "BSC") {
          Pool = poolBSC;
        } else if (chainInfo.chainName === "Avalanche") {
          Pool = poolAvalanche;
        }
        let web3 = new Web3(chainInfo.rpcUrls[0])
        const routerContract = new web3.eth.Contract(ROUTER_ABI, Pool[0].routerAddr);
        routerContract.methods.getAmountsOut('1000000000000000000', [Pool[0].baseTokenAddr, Pool[0].usdAddr]).call(
        ).then((res) => {
          const basePrice = Number(res[1]) / Math.pow(10, Pool[0].usdDecimal);
          setBaseTokenInUsd(basePrice);
          console.log('base', basePrice)
          routerContract.methods.getAmountsOut('1000000000000000000', [Pool[0].token0, Pool[0].baseTokenAddr]).call(
          ).then((amount) => {
            setOpusTokenInUsd(amount[1] / Math.pow(10, 18) * basePrice)
            console.log('opus', amount[1] / Math.pow(10, 18) * basePrice)
          })
        }).catch(() => {
          setBaseTokenInUsd(0)
          setOpusTokenInUsd(0)
        })
      }
    }

    getBasicPrices();
    const fetchBasicPrices = setInterval(getBasicPrices, 6000);

    return () => {
      clearInterval(fetchPoolInfos);
      clearInterval(fetchBasicPrices);
    }
  })

  const getYourAllTvl = async (poolDataInfo) => {
    let yourAllTvl = 0;
    for (let i = 1; i < poolDataInfo.length; i++) {
      const element = poolDataInfo[i];
      let web3 = new Web3(chainInfo.rpcUrls[0])
      const farmContract = new web3.eth.Contract(FARMING_ABI, element.farmAddr);
      let res = await farmContract.methods.userInfo(element.pid, connectedAddr).call()
      const lpContract = new web3.eth.Contract(ERC20_ABI, element.lpAddr)
      let lpOfFarm = await lpContract.methods.balanceOf(element.farmAddr).call()
      const share = Number(res.amount) / Number(lpOfFarm);
      yourAllTvl = yourAllTvl + share * element.tvl
    }
    setYourAllTlvOnChain(yourAllTvl)
  }

  useEffect(() => {
    if (poolData && poolData.length > 0) {
      let farmForTopApr;
      let allTvl = 0;
      for (let i = 1; i < poolData.length; i++) {
        if (poolData[i].tvl) {
          allTvl = allTvl + poolData[i].tvl
        }
        if (!farmForTopApr || (poolData[i].total > farmForTopApr.total && poolData[i].total > 0)) {
          farmForTopApr = poolData[i]
        }
      }
      setTotallockedOnChain(allTvl)
      if (connectedAddr !== "" && connectedAddr !== "Connect") {
        getYourAllTvl(poolData)
      }
      if (farmForTopApr && farmForTopApr.total > 0){
        console.log('top farming!!!!!!!!!!!!!!!!!!!!!!!!', farmForTopApr)
        setTopAprFarm(farmForTopApr)
        if (connectedAddr !== "" && connectedAddr !== "Connect") {
          let web3 = new Web3(chainInfo.rpcUrls[0])
          const farmContract = new web3.eth.Contract(FARMING_ABI, farmForTopApr.farmAddr);
          farmContract.methods.userInfo(farmForTopApr.pid, connectedAddr).call(
          ).then((res) => {
            console.log(res.amount, typeof(res.amount))
            const lpContract = new web3.eth.Contract(ERC20_ABI, farmForTopApr.lpAddr)
            lpContract.methods.balanceOf(farmForTopApr.farmAddr).call(
            ).then((lpOfFarm) => {
              const share = Number(res.amount) / Number(lpOfFarm);
              setYourTlvForTF(share * farmForTopApr.tvl)
            })          
          })
        }
      }

      let web3 = new Web3(chainInfo.rpcUrls[0])
      let stakePool = poolData[0];
      const lpContract = new web3.eth.Contract(ERC20_ABI, stakePool.lpAddr)
      lpContract.methods.balanceOf(stakePool.farmAddr).call(
      ).then((lpOfFarm) => {
        let totalStaked = Number(lpOfFarm) / Math.pow(10, stakePool.decimal1);
        setTotalStakedToken(totalStaked);
        let aprPerYear = (totalStaked === 0) ? 0 : (stakePool.totalTokenPerYear * stakePool.poolWeight) / totalStaked * 100;
        setStakingAPY(aprPerYear);
        setStakeDailyAPR(aprPerYear / 365)
        if (connectedAddr !== "" && connectedAddr !== "Connect") {
          const farmContract = new web3.eth.Contract(FARMING_ABI, stakePool.farmAddr);
          farmContract.methods.userInfo(stakePool.pid, connectedAddr).call(
          ).then((res) => {
            setYourStakedToken(Number(res.amount) / Math.pow(10, stakePool.decimal1))
          })
        }
      })
    }
  }, [poolData])


  return (
    <div className="home">
      <TopBar
        bar={bar}
        setBar={setBar}
        showBar={showBar}
        setShowBar={setShowBar}
        paddingLeft={paddingLeft}
        setPaddingLeft={setPaddingLeft}
        paddingRight={paddingRight}
        setPaddingRight={setPaddingRight}
      />

      <div className="home__body">
        <div className="home__row">
          <div className="home__col-1">
            <Carousel fade>
            <Carousel.Item>
            <div className="home__card dark:bg-shark-light-500">
              <div className="home__card-body">
                <h2 className="dark:text-white">
                  Canopus Yield Farming & Staking
                </h2>

                <p className="dark:text-white">
                Utilize funds supplied by other users to earn up to 1000% APY on Canopus Yield Farming and Staking. 
                Take your Investment to the next level.
                </p>
                <div className="home__card-buttons">
                  <button class="home__card-btn">Start farming</button>
                </div>
              </div>
              <div className="home__card-image-container">
                <figure
                  className="home__card-image"
                  style={{
                    backgroundImage: `url(${
                      theme === "dark" ? HomeLight : HomeLight
                    })`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "right center",
                  }}
                >
                  {<img
                    src={`${theme === "dark" ? HomeLight : HomeLight}`}
                    alt="billboard"
                  />}
                </figure>
              </div>
            </div>
            </Carousel.Item>
            <Carousel.Item>
            <div className="home__card-extra dark:bg-shark-light-500" onClick={() => {window.open('https://canopusblog.medium.com/1000-canopus-liquidity-competition-on-pangolin-3rd-round-33d55922dc5b', '_blank')}}>
            </div>
            </Carousel.Item>
            </Carousel>
          </div>

          <div className="home__col-2">
            <div className="home__card dark:bg-shark-light-500">
              <div className="home__card-info">
                <div className="home__info-half">
                  <div
                    className="info-box"
                    style={{ marginRight: "10px !important" }}
                  >
                    <div className="dark:bg-shark-500">
                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        Total Locked Value:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{
                          paddingBottom: "10px",
                          fontWeight: "600",
                        }}
                      >
                        
                        ${(!poolData || !poolData.length) ? 0.00 : totalLockedOnChain.toFixed(4)}
                      </p>

                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        Your {/*topAprFarm.name*/} TLV:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{ fontWeight: "600" }}
                      >
                        ${(connectedAddr === "" || connectedAddr === "Connect"/* || !topAprFarm.tvl*/) ? 0.00 : /*Number(yourTlvForTF)*/yourAllTlvOnChain.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="info-box"
                    style={{ marginRight: "10px !important" }}
                  >
                    <div className="info-active dark:bg-shark-500">
                      <span className="dark:text-white">Top APR:</span>
                      <p
                        className="dark:text-white"
                        style={{ paddingBottom: "10px", fontWeight: "600" }}
                      >
                        {(!topAprFarm.total) ? 0 : Number(topAprFarm.total * 100).toFixed(3)}%
                      </p>

                      <span className="dark:text-white">Top Farm:</span>
                      <p
                        className="dark:text-white"
                        style={{ fontWeight: "600" }}
                      >
                        {(topAprFarm && topAprFarm.name) ? topAprFarm.name : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="home__info-half">
                  <div
                    className="info-box"
                    style={{ marginRight: "10px !important" }}
                  >
                    <div className="dark:bg-shark-500">
                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        Total Staked OPUS:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{
                          paddingBottom: "10px",
                          fontWeight: "600",
                        }}
                      >
                        {(!totalStakedToken) ? 0 : Number(totalStakedToken).toFixed(0)}
                      </p>

                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        Your Staked OPUS:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{ fontWeight: "600" }}
                      >
                        {(connectedAddr === "" || connectedAddr === "Connect" || !yourStakedToken) ? 0 : Number(yourStakedToken).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="info-box"
                    style={{ marginRight: "10px !important" }}
                  >
                    <div className="dark:bg-shark-500">
                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        OPUS APR:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{
                          paddingBottom: "10px",
                          fontWeight: "600",
                        }}
                      >
                        {(!stakingAPY) ? 0 : stakingAPY.toFixed(4)}%
                      </p>

                      <span
                        className="dark:text-white"
                        style={{ opacity: "0.5" }}
                      >
                        OPUS Daily:
                      </span>
                      <p
                        className="dark:text-white"
                        style={{ fontWeight: "600" }}
                      >
                        {(!satkeDailyAPR) ? 0 : satkeDailyAPR.toFixed(4)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="home__row">
          <div className="home__options">
            <h1 className="dark:text-white">All active pools</h1>

            <div className="home__select dark:bg-shark-light-500">
              <div
                className={`home__select-option ${
                  pool === "Avalanche" && "home__select-option--active"
                }`}
                onClick={() => switchNetwork("Avalanche")}
              >
                Avalanche
              </div>

              <div
                className={`home__select-option ${
                  pool === "BSC" && "home__select-option--active"
                }`}
                onClick={() => switchNetwork("BSC")}
              >
                BSC
              </div>
            </div>

            <Modal
              backdrop="false"
              show={showFarmModal}
              onHide={() => setShowFarmModal(!showFarmModal)}
              style={{ borderRadius: "50px" }}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header
                className="dark:bg-shark-light-500 dark:text-white dark:border-shark-500"
                closeButton
              >
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                  Farm {poolInfoSelected.name} Pool
                </h2>
              </Modal.Header>

              <Modal.Body className="dark:bg-shark-light-500 dark:text-white dark:border-shark-500">
                <div class="modal__body">
                  <div class="modal__items">
                    <div className="modal__item">
                      <p>Total Locked Value</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>${Number(poolInfoSelected.tvl).toFixed(4)}</span>}</span>
                    </div>

                    <div className="modal__item">
                      <p>Daily APR</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{Number(poolInfoSelected.daily * 100).toFixed(3)}%</span>}</span>
                    </div>

                    <div className="modal__item">
                      <p>Total APR</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{Number(poolInfoSelected.total * 100).toFixed(3)}%</span>}</span>
                    </div>

                    <div className="modal__item">
                      <p>Referral Percentage</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{poolInfoSelected.referral}</span>}</span>
                    </div>

                    <div className="modal__item">
                      <p>Reward token</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{poolInfoSelected.rewardToken}</span>}</span>
                    </div>

                    {(poolInfoSelected && poolInfoSelected.joined) && <div className="modal__item">
                      <p>{poolInfoSelected.rewardToken} Earned&nbsp;</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{opusEarned.toFixed(4)}</span>}</span>
                    </div>}

                    {(poolInfoSelected && poolInfoSelected.joined) && <div className="modal__item">
                      <p>Pending {poolInfoSelected.rewardToken}</p>
                      <span>{(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{pendingOpus}</span>}</span>
                    </div>}
                  </div>
                </div>
                {poolInfoSelected.joined && 
                <>
                  <div className="info dark:text-white">
                    <span
                      style={{ marginTop: "5px" }}
                    >
                      {poolInfoSelected.name} LP Staked&nbsp;
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#f7c522",
                        }}
                      >
                        {lpStakedCurrPool.toFixed(4)}
                      </span>
                    </span>
                    <div className="pool__leverage">
                      <div className="int-input" onClick={() => {lpMove(true)}}>
                        <span
                          className="int-btn"
                        >
                          -
                        </span>
                      </div>
                      <div className="int-input" style={{marginLeft: 10}} onClick={() => {lpMove(false)}}>
                        <span
                          className="int-btn"
                        >
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="info dark:text-white">
                    <button
                      className="pool__cta-btn"
                      onClick={harvest}
                    >
                      Harvest
                    </button>
                  </div>

                  {/*<div
                    style={{ marginBottom: "20px" }}
                    className="supply__input dark:bg-shark-500 dark:text-white"
                  >
                    <input
                      className="dark:text-white"
                      type="number"
                      value="0"
                    />
                    <span className="opacity-50" style={{marginRight: 10}}>Max</span>
                  </div>*/}
                </>}
                {!poolInfoSelected.joined &&<div
                  style={{ marginBottom: "20px" }}
                  className="supply__input dark:bg-shark-500 dark:text-white"
                >
                  <button
                    className="pool__cta-btn"
                    onClick={() => {enableFarming()}}
                  >
                    Enable farming
                  </button>
                </div>}
              </Modal.Body>   
            </Modal>

            <Modal
              show={showLpModal}
              onHide={() => setShowLpModal(!showLpModal)}
              style={{ borderRadius: "50px" }}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header
                className="dark:bg-shark-light-500 dark:text-white dark:border-shark-500"
                closeButton
              >
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                  Farm {poolInfoSelected.name} Pool
                </h2>
              </Modal.Header>

              <Modal.Body className="dark:bg-shark-light-500 dark:text-white dark:border-shark-500">
                <div class="modal__body">
                </div>
                
                {willWithdraw ? <div className="info dark:text-white">
                  <span
                    style={{ marginTop: "5px" }}
                  >
                    {poolInfoSelected.name} LP Staked&nbsp;
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#f7c522",
                      }}
                    >
                      {lpStakedCurrPool.toFixed(4)}
                    </span>
                  </span>
                </div>
                : <div className="info dark:text-white">
                  <span
                    style={{ marginTop: "5px" }}
                  >
                    {poolInfoSelected.name} LP Balance&nbsp;
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#f7c522",
                      }}
                    >
                      {lpBalCurrPool.toFixed(4)}
                    </span>
                  </span>
                </div>}
                <div
                  style={{ marginBottom: "20px" }}
                  className="supply__input dark:bg-shark-500 dark:text-white"
                >
                  <input
                    className="dark:text-white"
                    type="number"
                    value={willWithdraw ? inputWithdraw : inputDeposit}
                    onChange={validInput}
                  />
                  <span className="opacity-50" style={{marginRight: 10, cursor: "pointer"}} onClick={onClickMax}>Max</span>
                </div>
                <div className="info dark:text-white">
                  <button
                    className="pool__cta-btn"
                    onClick={willWithdraw ? () => {withdraw()} : () => {deposit()}}
                  >
                    {willWithdraw ? "Withdraw" : "Deposit"}
                  </button>
                </div>
              </Modal.Body>   
            </Modal>

            <div className="home__data">
              {
                <>
                  {poolData.slice(1, poolData.length).map((p, i) => (
                    <div
                      className="pool home__card dark:bg-shark-light-500 dark:text-white"
                      key={i}
                    >
                      <h2 className="dark:border-shark-500">
                        {p.title}
                        <img src={p.images[0]} alt="billboard" style={{width: 26, height: 26, display: "inline", marginLeft: 10, marginRight: -10}}/>
                        <img src={p.images[1]} alt="billboard" style={{width: 26, height: 26, display: "inline"}}/>
                      </h2>

                      <div className="pool__body">
                        <h3>{p.name}</h3>

                        <p className="pool__info">
                          <span>Total Locked Value</span>
                          {(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>${Number(p.tvl).toFixed(4)}</span>}
                        </p>

                        <p className="pool__info">
                          <span>Daily APR</span>
                          {(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{Number(p.daily * 100).toFixed(3)}%</span>}
                        </p>

                        <p className="pool__info">
                          <span>Total APR</span>
                          {(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{Number(p.total * 100).toFixed(3)}%</span>}
                        </p>

                        <p className="pool__info">
                          <span>Referral Percentage</span>
                          {(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{p.referral}</span>}
                        </p>

                        <p className="pool__tokens">
                          <span>Reward token</span>
                          {(connectedAddr === "" || connectedAddr === "Connect") ? <span className="unknown_value">&zwnj;</span> : <span>{p.rewardToken}</span>}
                        </p>
                      </div>
                      <div className="pool__cta" style={{marginTop: 15, marginBottom: 15}}>
                        <button
                          className="pool__cta-btn"
                          onClick={() => {window.open(p.lpUrl, '_blank')}}
                        >
                          Add {p.name} Liquidity
                        </button>
                      </div>

                      <div className="pool__cta">
                        <button
                          className="pool__cta-btn"
                          onClick={() => enterFarm(p)}
                        >
                          {p.joined ? "Farm now" : "Enable Farming"}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
