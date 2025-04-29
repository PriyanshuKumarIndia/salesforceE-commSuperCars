import { LightningElement, track,api } from 'lwc';
import createCustomAccount from '@salesforce/apex/AccountController.createCustomAccount';
import createAccountLogin from '@salesforce/apex/AccountController.createAccountLogin';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SupercarAuth extends LightningElement {
  @track isLogin = true;
  @track isSignup = false;

  @track isLoggedin = false;
  @track customAccountId;

  @track meterStyle = 'width: 0%; background-color: #ff4400;';

  @track loginEmail = '';
  @track loginPassword = '';

  @track signupPhone = '';
  @track signupEmail = '';
  @track signupPassword = '';
  @track passwordStrengthText = '';

  @track userTypeOptions = [];
  @track userType = '';
  @track username = '';
  @track address = '';

  @track loginPasswordType = 'password';
  @track signupPasswordType = 'password';
  @track loginPasswordIcon = 'utility:preview';
  @track signupPasswordIcon = 'utility:preview';

  @track isLoading = false;

  connectedCallback() {
    this.userTypeOptions = [
      { label: 'Customer', value: 'Customer' },
      { label: 'Supplier', value: 'Supplier' }
    ];
  }

  showLogin() {
    this.isLogin = true;
    this.isSignup = false;
  }

  showSignup() {
    this.isLogin = false;
    this.isSignup = true;
  }

  handleLoginEmail(event) {
    this.loginEmail = event.target.value;
  }

  handleLoginPassword(event) {
    this.loginPassword = event.target.value;
  }

  handleSignupEmail(event) {
    this.signupEmail = event.target.value;
  }

  handleSignupPassword(event) {
    const pwd = event.target.value;
    const strength = this.calculateStrength(pwd);
    const color = this.getStrengthColor(strength);
    this.passwordStrengthText = this.getStrengthText(strength);

    if(pwd.length == 0){
      this.meterStyle = 'width: 0%; background-color: #ff4400;';
      this.passwordStrengthText = '';
      return;
    }

    let widthPercent = strength === 0 ? 10 : strength * 25;
    this.meterStyle = `width: ${widthPercent}%; background-color: ${color};`;

    this.signupPassword = pwd;
}

getStrengthText(strength){
    const strengths = ['WEAK','WEAK',  'MEDIUM', 'STRONG', 'Superrrrrrrr'];
    return strengths[strength];
}
  
getStrengthColor(strength) {
    const colors = ['#f00','#e37114',  '#ffaa00', '#00cc66', '#00ff00'];
    return colors[strength];
}

calculateStrength(pwd) {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
}


handleUserType(event) {
  this.userType = event.detail.value;
}

handleUsername(event) {
  this.username = event.target.value;
}

handleAddress(event) {
  this.address = event.target.value;
}

handleSignupPhone(event) {
  this.signupPhone = event.target.value;
}

async handleLogin() {
  console.log('Entered login handler with' + this.loginEmail + ' ' + this.loginPassword);
  if(!this.validateLoginForm()){
    return;
  }

  try{
    const loginAccount = await createAccountLogin({Email: this.loginEmail.toLowerCase(),password: this.loginPassword});
    console.log('loginAccount : ' + loginAccount);

    if(loginAccount != null){
      this.customAccountId = loginAccount;
      console.log('Check Id : ' + this.customAccountId);
      this.showToast(
        'Success',
        'Logging in Successfull:)',
        'success');
        this.clearForm();
        this.isLoggedin = true;
      }
      else{
          this.showToast(
          'Error',
          'Invalid Credentials:(',
          'error');
      }
    }
    catch(error){
      console.log('Error logging in ' + error);
    }
}

async handleSignup() {
  if(!this.validateSignUpForm()){
    return;
  }
  try {
    const accountId = await createCustomAccount({
      username: this.username,
      email: this.signupEmail.toLowerCase(),
      phone: this.signupPhone,
      userType: this.userType,
      address: this.address,
      password: this.signupPassword
    });
    if(accountId == null){
      this.showToast(
        'Error',
        'Account creation failed :( Account with same Email or Phone already exists!',
        'error');
        return;
    }
        this.showToast(
            'Success',
            'Account Created Successfully, Enjoy shopping:) ',
            'success');
          

        this.customAccountId = accountId;
        console.log('Account Created: ' + this.customAccountId);
        this.clearForm();
        this.isLoggedin = true;
    } catch (error) {
        console.error('Error creating account:', error);
    }
}


  toggleLoginPassword() {
    this.loginPasswordType = this.loginPasswordType === 'password' ? 'text' : 'password';
    this.loginPasswordIcon = this.loginPasswordType === 'password' 
      ? 'utility:preview' 
      : 'utility:hide';
  }
  
  toggleSignupPassword() {
    this.signupPasswordType = this.signupPasswordType === 'password' ? 'text' : 'password';
    this.signupPasswordIcon = this.signupPasswordType === 'password' 
      ? 'utility:preview' 
      : 'utility:hide';
  }

  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
}

  handleLogout(){
  this.isLoggedin = false;
}

  clearForm(){
    this.loginEmail = '';
    this.loginPassword = '';
  
    this.signupPhone = '';
    this.signupEmail = '';
    this.signupPassword = '';
    this.passwordStrengthText = '';
    this.userType = '';
    this.username = '';
    this.address = '';
    this.meterStyle = 'width: 0%; background-color: #ff4400;';

    this.loginPasswordType = 'password';
    this.signupPasswordType = 'password';
    this.loginPasswordIcon = 'utility:preview';
    this.signupPasswordIcon = 'utility:preview';

  }

  validateLoginForm(){
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginEmail)) {
      this.showToast('Error', 'Invalid email format', 'error');
      return false;
    }
    return true;
  }

  validateSignUpForm(){
    if(/[^0-9]/.test(this.signupPhone) ){
      this.showToast('Error', 'Phone number should be numeric', 'error');
      return false;
    }
    if(this.signupPhone.length != 10){
      this.showToast('Error','Phone number should be of length 10','error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.signupEmail)) {
      this.showToast('Error', 'Invalid email format', 'error');
      return false;
    }
    return true;
  }

}