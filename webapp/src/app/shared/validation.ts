// Original version created by Cory Rylan: https://coryrylan.com/blog/angular-2-form-builder-and-validation-management
import { Injectable } from '@angular/core';

import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            required: 'Campo obrigatório',
            invalidNumberField: 'Only numbers allowed',
            invalidDateField: 'Not a valid date',
            invalidCreditCard: 'Is invalid credit card number',
            invalidEmailAddress: 'Invalid email address',
            invalidPassword: 'Invalid password. Password must be at least 6 characters long, and contain a number.',
            invalidPasswords: 'As senhas não coincidem',
            minlength: `Minimum length ${validatorValue.requiredLength}`,
        };

        return config[validatorName];
    }

    static numberFieldValidator(_control) {
        // if (control.value.match(/^([0-9]|[0-9][0-9]|[1-9][0-9][0-9])$/)) {
        //     return null;
        // } else {
        //     return { 'invalidNumberField': true };
        // }

        return null;
    }

    // static emailValidator(control) {
    //     RFC 2822 compliant regex
    // if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&
    // '*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
    //     return null;
    // } else {
    //     return {'invalidEmailAddress': true};
    // }
    // }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return null;
        } else {
            return { invalidPassword: true };
        }
    }

    static passwordCompareValidator(fg) {
        if (fg.value.password === fg.value.confirm_password) {
            return null;
        } else {
            return { invalidPasswords: true };
        }
    }
}

// tslint:disable:max-classes-per-file
@Injectable()
export class CustomFB extends FormBuilder {
    group(controlsConfig: { [key: string]: any; }, extra?: { [key: string]: any; }): CustomFG {
        const group = super.group(controlsConfig, extra);
        return new CustomFG(group.controls, group.validator, group.asyncValidator);
    }
}

export abstract class CustomControl extends AbstractControl {
    customErrors: string[];
}

export class CustomFG extends FormGroup {
    controls: {
        [key: string]: CustomControl;
    };

    getControlErrors(control: CustomControl): string[] {
        let errorList: string[] = [];
        if (control.errors != null) {
            for (const error in control.errors) {
                if (control.errors.hasOwnProperty(error)) {
                    if (error !== 'customError') {
                        errorList.push(ValidationService.getValidatorErrorMessage(error, control.errors[error]));
                    }
                }
            }
        }
        errorList = errorList.concat(control.customErrors);
        return errorList;
    }

    getControlMessages(controlName: string): string {
        const control = this.controls[controlName];
        return this.getControlErrors(control).join(';');
    }

    pushFieldErrors(errorList: any) {
        for (const error in errorList) {
            if (this.controls.hasOwnProperty(error)) {
                this.controls[error].setErrors({ customError: true });
                this.controls[error].customErrors = errorList[error];
            }
        }
    }
}
