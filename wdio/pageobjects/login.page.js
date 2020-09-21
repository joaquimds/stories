/* global $ */

import Page from './page'

/**
 * sub page containing specific selectors and methods for a specific page
 */
export default class LoginPage extends Page {
  /**
   * define selectors using getter methods
   */
  get inputEmail() {
    return $('#email')
  }
  get inputPassword() {
    return $('#password')
  }
  get btnSubmit() {
    return $('button.submit')
  }

  /**
   * a method to encapsule automation code to interact with the page
   * e.g. to login using username and password
   */
  login(username, password) {
    this.inputEmail.setValue(username)
    this.inputPassword.setValue(password)
    this.btnSubmit.click()
  }

  /**
   * overwrite specifc options to adapt it to page object
   */
  open() {
    return super.open('login')
  }
}

export const loginPage = new LoginPage()
