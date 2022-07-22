import React, { Component } from 'react'
import classNames from 'classnames'
import { caver } from 'klaytn/caver'

import Input from 'components/Input'
import AccessReminder from 'components/AccessReminder'
import Button from 'components/Button'
import { isValidPrivateKey, klayKeyDecomulation, encryptAction, klaytnKeyCheck} from 'utils/crypto'
import './AccessByPrivatekey.scss'

type Props = {

}

class AccessByPrivateKey extends Component<Props> {
  state = {
    privatekey: '',
    isValid: null,
    isReminderChecked: false,
    address: '',
  }

  handleChange = (e) => {
    let walletData = e.target && e.target.value
    let name = e.target && e.target.name
    let inputValue , address
    const addressCheck = klaytnKeyCheck(e.target.value)
    this.setState({address: '' })
    if(addressCheck && walletData && walletData.length == 112){
      inputValue = walletData.slice(0, 66)
      address = walletData.slice(70, 112) 
      this.setState({address: address })
    }else{
      inputValue = walletData
    }
    if(name){
      this.setState({
        [name]: inputValue,    
      })
    }
    this.setState({
      isValid: inputValue.length === 0
        ? null
        : inputValue.length == 66 && isValidPrivateKey(inputValue),
    })
  }

  toggleChecking = () => {
    this.setState({
      isReminderChecked: !this.state.isReminderChecked
    })
  }
  access = async () => {
    const { privatekey, address } = this.state
    const { accessTo } = this.props
    let wallet, isHumanReadable
    caver.klay.accounts.wallet.clear()
    isHumanReadable = ''//await caver.utils.isConvertableToHRA(address)
    if(address){
      wallet = caver.klay.accounts.wallet.add(privatekey,address)
      sessionStorage.setItem('address', isHumanReadable ? caver.utils.hexToUtf8(address):address )
    }else{
      wallet = caver.klay.accounts.wallet.add(privatekey)
    }
    // WARNING: sessionStorage has private key. it expired when window tab closed.
    const privateKeyencrypt = encryptAction(wallet.privateKey)
    sessionStorage.setItem('was', privateKeyencrypt)
    if (typeof accessTo === 'function') accessTo(address? address : wallet.address)
  }

  render() {
    const { 
      isValid,
      isReminderChecked,
    } = this.state
    return (
      <div className="AccessByPrivatekey">
        <p className="WalletAccess2__description">
          You can access your account using your private key or Klaytn Wallet Key.<br />
          Alternatively, you can use your keystore file and password to sign-in.
        </p>
        <Input
          label="Klaytn Wallet Key or Private Key"
          type="password"
          autoFocus
          name="privatekey"
          className="AccessByPrivatekey__input"
          placeholder="Enter the Klaytn wallet key or private key"
          onChange={this.handleChange}
          isValid={isValid }
          autoComplete="off"
          errorMessage={isValid === false && 'Invalid key'}
          isSuccess={isValid}
        />
        <AccessReminder 
          isChecked={isReminderChecked}
          onClick={this.toggleChecking}
        />
        <Button
          className="AccessByPrivatekey__button"
          disabled={!isValid || !isReminderChecked }
          onClick={this.access}
          title="Access"
        />
      </div>
    )
  }
}

export default AccessByPrivateKey
