
function setData(docElementId, html, errored) {
    document.getElementById(docElementId).innerHTML = html;
    if (errored) document.getElementById(docElementId).classList = 'notready';
    else document.getElementById(docElementId).classList = 'ready';
}



// Since some of the functons/API are not available based on the
// Node type - this function disables certainelements
function    setUIBasedOnNodeType(){
    // Unlock Account - Check the node type

    if(nodeType === 'metamask' || nodeType == 'testrpc'){
        setData('lock_unlock_result','Unlock / lock ( ) not supported for '+nodeType,true);
    } else {
        setData('lock_unlock_result','--',false);
    }
    // Compiler options
    if(nodeType === 'geth' || nodeType === 'metamask'){
        // Not supported for geth & metamask
        setData('list_of_compilers','getCompilers ( ) & compileSolidity ( ) not supported for '+nodeType,true);

        // Disable the compile butto
        document.getElementById('button_do_compile').disabled = true;
        //document.getElementById("sourcecode").value="Compile sample contract in Remix | Wallet | solc . Copy & Paste the Bytecode | ABIDefinition for deployment.";
        document.getElementById('sourcecode').disabled=true;
    } else {
        setData('list_of_compilers','--',false);
        document.getElementById('button_do_compile').disabled = false;
        document.getElementById('sourcecode').disabled=false;
    }

    // This simply creates the JSON for default transaction object
    //generateTransactionJSON();
    //copyBytecodeInterfaceToUI();
}


/**
 * Removes all of the <li> in List
 */
function removeAllChildItems(elementId){
    var ele = document.getElementById(elementId);
    while (ele.hasChildNodes()) {
        ele.removeChild(ele.firstChild);
    }
}

/**
 * Creates a list item for the account in the account list
 */
function addAccountsToList(listId,index,account){
    var li = document.createElement('LI');
    var input = document.createElement('INPUT')
    input.value = account;
    input.id = 'account'+index;
    input.setAttribute("readonly", "readonly");
    li.appendChild(input);
    var list = document.getElementById(listId);
    list.appendChild(li);
}


/**
 * Creates a list item for the balance in the account balance list
 */
function addAccountBalancesToList(listId,index,account,accountBalance){
    /*
    var li = document.createElement('LI');
    li.class='ready'
    //var input = document.createElement('P');
    var input = document.createElement('INPUT')
    //input.value = account+""+accountBalance+' Ether';
    /input.value = account;
    //input.disabled=true;
    input.setAttribute("readonly", "readonly");
    li.appendChild(input);
    var list = document.getElementById(listId);
    list.appendChild(li);*/

    console.log(account);
    var li = document.createElement('LI');
    li.class='ready'
    var input = document.createElement('h3');
    input.class = 'ready';
    input.innerText=account+':\t'+accountBalance+' Ether';
    li.appendChild(input);
    var list = document.getElementById(listId);
    list.appendChild(li)
}


/**
 * This populates all <SELECT> boxes with accounts
 */
function    addAccountsToSelects(accounts){
    removeAllChildItems('select_to_unlock_account');
    for (var i = 0; i < accounts.length; i++) {
        addOptionToSelect('select_to_unlock_account', accounts[i].substring(0,15)+'...', accounts[i]);
    }
}

/**
 * Add options to a <select>
 */
function    addOptionToSelect(selectId, text, value){
    var option = document.createElement('OPTION');
    option.text = text;
    option.value = value;
    var select = document.getElementById(selectId);
    select.appendChild(option)

    // lets try data list add
    // select = document.getElementById("browsers");
    // option = document.createElement('OPTION');
    // option.text=text
    // select.appendChild(option)
}
