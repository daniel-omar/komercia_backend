import { HttpStatus, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
    constructor() { }

    async genExcel(data) {

        try {
            const workbook = new ExcelJS.Workbook(); // Create a new workbook
            const worksheet = workbook.addWorksheet('Reporte'); // New Worksheet
            const path = process.env.PATH_FOLDER_TEMP;  // Path to download excel
            worksheet.columns = data.headers;

            let num = 0;
            for (const key in data.rows) {
                worksheet.addRow(data.rows[key]);
                num++;
            }

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {
                    bold: true,
                    color: { argb: 'ffffff' },
                    size: 12,
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'd00411' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            let urlFile = '';
            // const time = moment().format('YYYY-MM-DD_HH-mm-ss');
            const file_name = `report_${0}.xlsx`;
            await workbook.xlsx.writeFile(`${path}/${file_name}`).then(() => {
                urlFile = `${path}/${file_name}`;
            });

            return {
                status: HttpStatus.OK,
                message: 'file_created_success',
                data: {
                    path: urlFile,
                    file_name: file_name,
                },
                errors: null,
            };
        } catch (error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'file_created_error',
                data: null,
                errors: [error.message],
            };
        }

    }

    async loadFromBuffer(data: any) {
        const workbook = new ExcelJS.Workbook();
        return await workbook.xlsx.load(data);
    }

    async genExcelWithBorder(data, hasBorder: boolean) {

        try {
            const workbook = new ExcelJS.Workbook(); // Create a new workbook
            const worksheet = workbook.addWorksheet('Reporte'); // New Worksheet

            worksheet.columns = data.header;
            worksheet.getRow(1).values = data.header.map(x => x.name)
            //worksheet.getRow(1).font = { bold: true };

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {
                    bold: true,
                    color: { argb: 'ffffff' },
                    size: 12,
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '05C65D' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            const filas = data.rows.map(r => Object.values(r));
            worksheet.addRows(filas);

            if (hasBorder) {
                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber > 1) {
                        worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, (cell) => {
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        });
                    }
                });
            }

            //urlFile = path.join(process.env.PATH_FOLDER_TEMP,file_name);  // Path to download excel
            //urlFile = path.join(__dirname, '..', '..', 'files', 'sensitive-data', file_name);;  // Path to download excel
            // await workbook.xlsx.writeFile(urlFile).then((res) => {
            //     console.log(res)
            // });
            let base64data;
            let bufferdata;
            await workbook.xlsx.writeBuffer().then(async (data_) => {
                base64data = Buffer.from(data_).toString("base64");
                bufferdata = data_;
            });
            console.log(bufferdata)
            return {
                status: HttpStatus.OK,
                message: 'file_created_success',
                data: {
                    filename: data.file_name,
                    base64data,
                    bufferdata,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    disposition: 'attachment'
                },
                errors: null,
            };
        } catch (error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'file_created_error',
                data: null,
                errors: [error.message],
            };
        }

    }
}