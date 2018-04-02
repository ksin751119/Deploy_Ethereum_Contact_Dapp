
var autoRetrieveFlag = false;
var     nodeType = 'geth';
var accounts;
var compiler;
var optimize = 1;

/**
 * Get the version information for Web3
 */


 window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.log('Injected web3 Not Found!!!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

    var provider = document.getElementById('provider_url').value;
    window.web3 = new Web3(new Web3.providers.HttpProvider(provider));
  }

  // Now you can start your app & access web3 freely:
  startApp()

})


function    setWeb3Version() {
    var versionJson = {};
    // Asynchronous version
    web3.version.getNode(function(error, result){
        if(error) setData('version_information',error,true);
        else {
            setData('version_information',result,false);
            console.log(result)

            if(result.toLowerCase().includes('metamask')){
                nodeType = 'metamask';
            } else if(result.toLowerCase().includes('testrpc')){
                nodeType = 'testrpc';
            } else {
                nodeType = 'geth';
            }


            // set up UI elements based on the node type
            setUIBasedOnNodeType();
        }
    });
}




function    startApp(){

    // If the app is reconnected we should reset the watch
    //doFilterStopWatching();
    //doContractEventWatchStop();

    // Set the connect status on the app
    if (web3 && web3.isConnected()) {
        setData('connect_status','Connected', false);

        // Gets the version data and populates the result UI
        setWeb3Version();

        if(autoRetrieveFlag) doGetAccounts();
        //doGetAccounts();

    } else {
        setData('connect_status','Not Connected', true);
    }

    // no action to be taken if this flag is OFF
    // during development for convinience you may set autoRetrieveFlag=true
    doGetCompilers();
    if(!autoRetrieveFlag)  return;



    // doConnect();
    // // doGetAccounts();
    doGetNodeStatus();

    // Compilation is available only for TestRPC
    // Geth 1.6 and above does not support compilation
    // MetaMask does not support compilation
    doGetCompilers();



}

function doConnect()    {

    // Get the provider URL
    var provider = document.getElementById('provider_url').value;
    //var provider = document.getElementById('provider_url').value;
    window.web3 = new Web3(new Web3.providers.HttpProvider(provider));
    startApp();

}


function    doGetNodeStatus()  {

    // Asynch version
    web3.net.getListening(function(error, result){
        if(error) setData('get_peer_count',error,true);
        else {
            // Since connected lets get the count
            web3.net.getPeerCount(  function(  error,  result ) {
            if(error){
                setData('get_peer_count',error,true);
            } else {
                setData('get_peer_count','Peer Count: '+result,(result == 0));
            }
        });
        }
    });
}



function    doGetAccounts() {
    // This is the synch call for getting the accounts
    // var accounts = web3.eth.accounts

    // Asynchronous call to get the accounts
    // result = [Array of accounts]
    // MetaMask returns 1 account in the array - that is the currently selected account
    web3.eth.getAccounts(function (error, result) {
        if (error) {
            setData('accounts_count', error, true);
        } else {
            accounts = result;
            console.log(result.length);

            setData('accounts_count', result.length, false);
            // You need to have at least 1 account to proceed

            if(result.length == 0) {
                if(nodeType == 'metamask'){
                    alert('Please Unlock MetaMask and click buttom again');
                }
                return;
            }

            // Remove the list items that may already be there
            //removeAllChildItems('accounts_list');
            // Add the accounts as list items
            /*for (var i = 0; i < result.length; i++) {
                addAccountsToList('accounts_list',i,result[i])
            }*/

            var coinbase = web3.eth.coinbase;
            // trim it so as to fit in the window/UI
            //if(coinbase) coinbase = coinbase.substring(0,25)+'...'
            setData('coinbase', coinbase, false);
            // set the default accounts
            var defaultAccount = web3.eth.defaultAccount;
            if(!defaultAccount){
                web3.eth.defaultAccount =  result[0];
                defaultAccount = result[0];
            }

            //defaultAccount = defaultAccount.substring(0,25)+'...';
            setData('defaultAccount', defaultAccount, false);
        }
        // Get the balances of all accounts doGetBalances
        doGetBalances(accounts)

        // This populates the SELECT boxes with the accounts
        addAccountsToSelects(accounts);
    });
}

/**
 * Get the balances of all accounts.
 */
function    doGetBalances(accounts) {

    // Remove the balances if they already exist
    removeAllChildItems('account_balances_list');

    // Add the balances as the list items
    for (var i = 0; i < accounts.length; i++) {
       console.log(accounts[i]);
       var account = accounts[i];
       // var bal = web3.eth.getBalance(accounts[i]);
       web3.eth.getBalance(accounts[i],web3.eth.defaultBlock,function(error,result){
           // Convert the balance to ethers
            var bal = web3.fromWei(result,'ether').toFixed(2);

            addAccountBalancesToList('account_balances_list',i,account,bal);
        });
    }
}



function    doUnlockAccount()  {

    setData('lock_unlock_result','...',true);
    var account = document.getElementById('select_to_unlock_account').value;
    console.log(account);
    var password = document.getElementById('unlock_account_password').value;

    // synchronous flavor
    // web3.personal.unlockAccount(account, password, duration)
    // web3.personal.unlockAccount(account, password)


    web3.personal.unlockAccount(account, password,function(error, result)  {

        // console.log(error,result)
        if(error){
            setData('lock_unlock_result',error,true);
        } else {
            // Result = True if unlocked, else false
            var str = account.substring(0,20)+'...Unlocked';
            if(result){
                setData('lock_unlock_result',str,false);
            } else {
                // This does not get called - since and error is returned for incorrect password :-)
                str = 'Incorrect Password???';
                setData('lock_unlock_result',str,true);
            }


        }
    });
}

/**
 * Lock the account
 */
function    doLockAccount() {



    setData('lock_unlock_result','...',true);
    var account = document.getElementById('select_to_unlock_account').value;
    //Synchronous flavor
    //web3.personal.lockAccount(account)

    web3.personal.lockAccount(account, function(error, result){

        console.log(error,result)
        if(error){
            setData('lock_unlock_result',error,true);
        } else {
            var str = account.substring(0,20)+'...Locked';
            setData('lock_unlock_result',str,false);
        }
    });
}


/**
 * Gets the list of compilers
 */
function doGetCompilers()  {
  BrowserSolc.getVersions(function(soljsonSources, soljsonReleases) {
  addCompileVersionsToSelects(soljsonReleases);
  /*for (var i = 0; i < Object.keys(soljsonReleases).length; i++) {
    var compilerVersion = soljsonReleases[_.keys(soljsonReleases)[i]];
    //console.log(compilerVersion);
    addOptionToSelect('select_to_compile_version', compilerVersion);
  }*/

  });
}


/**
 * Starting geth 1.6 - Solidity compilation is not allowed from
 * web3 JSON/RPC
 */

function    doCompileSolidityContract()  {



    console.log(document.getElementById('select_to_compile_version'));
    var compilerVersion = document.getElementById('select_to_compile_version').value;

    //console.log(source);
    window.BrowserSolc.loadVersion(compilerVersion, function(c) {
      compiler = c;
      console.log("Solc Version Loaded: " + compilerVersion);

      var source = document.getElementById('sourcecode').value;
      var result = compiler.compile(source, optimize);

      if(result.errors && JSON.stringify(result.errors).match(/error/i)){

        console.log(result.errors);
        setData('compilation_result',result.errors,true);
      } else {
        var thisMap = _.sortBy(_.map(result.contracts, function(val,key) {
          // ugly mapsort in react
            return [key,val];
          }), function(val) {
            return -1*parseFloat(val[1].bytecode);
          });

        console.debug(thisMap);
        var abi = JSON.parse(thisMap[0][1].interface);
        var bytecode = "0x" + thisMap[0][1].bytecode;
        document.getElementById('compiled_bytecode').value=bytecode;
        document.getElementById('compiled_abidefinition').value=JSON.stringify(abi);
        setData('compilation_result',"Compile Succussed",false);
      }
      });
}


/**
 * Deploys the contract - ASYNCH
 */

function    doDeployContract()   {
    // Reset the deployment results UI
    resetDeploymentResultUI();

    var     abiDefinitionString = document.getElementById('compiled_abidefinition').value;
    var     abiDefinition = JSON.parse(abiDefinitionString);

    var     bytecode = document.getElementById('compiled_bytecode').value;

    // 1. Create the contract object
    var  contract = web3.eth.contract(abiDefinition);

    // Get the estimated gas
    var   gas = document.getElementById('deployment_estimatedgas').value;

    // 2. Create the params for deployment - all other params are optional, uses default
    var  params = {
        from: web3.eth.coinbase,
        data: bytecode,
        gas: gas
    }
    console.log(params);

    // 3. This is where the contract gets deployed
    // Callback method gets called *2*
    // First time : Result = Txn Hash
    // Second time: Result = Contract Address
    var constructor_param = 10;

    contract.new(constructor_param,params,function(error,result){

        if(error){
            setData('contracttransactionhash','Deployment Failed: '+error,true);
        } else {
            console.log('RECV:',result)
            if(result.address){
                document.getElementById('contractaddress').value=result.address;
            } else {
                // gets set in the first call
                setData('contracttransactionhash',result.transactionHash, false);
            }
        }
    });
}
