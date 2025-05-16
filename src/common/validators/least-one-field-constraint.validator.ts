import { IsOptional, IsString, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// @ValidatorConstraint({ name: 'AtLeastOneField', async: false })
// export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
//     validate(_: any, args: ValidationArguments) {
//         const object = args.object as any;
//         console.log(object);
//         return !!(object.firstName || object.lastName);
//     }

//     defaultMessage(args: ValidationArguments) {
//         return `Al menos uno de los campos "firstName" o "lastName" debe estar presente.`;
//     }
// }


export function AtLeastOneField(
    fields: string[], // campos que quieres validar dinámicamente
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'AtLeastOneField',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(_: any, args: ValidationArguments) {
                    const obj = args.object as any;
                    return fields.some((field) => obj[field] !== undefined && obj[field] !== null && obj[field] !== '');
                },
                defaultMessage(args: ValidationArguments) {
                    return `Al menos uno de los siguientes campos debe estar presente: ${fields.join(', ')}`;
                },
            },
        });
    };
}