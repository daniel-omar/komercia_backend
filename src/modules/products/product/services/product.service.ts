import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';
import { ProductDao } from '../dao/product.dao';
import { Connection } from 'typeorm';
import { SaveProductDto } from '../dto/save-product.dto';
import * as ExcelJS from 'exceljs';
import { CargaDAO } from '@common/services/dao/carga.dao';
import { FormatoCargaDAO } from '@common/services/dao/formato-carga.dao';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';
import { SaveInventoryDto } from '../dto/save-inventory.dto';

@Injectable()
export class ProductService {

  constructor(
    private productDao: ProductDao,
    private cargaDAO: CargaDAO,
    private formatoCargaDAO: FormatoCargaDAO,
    private connection: Connection
  ) { }

  async getAll(): Promise<any> {

    try {
      const products = await this.productDao.getAll();
      return products;

    } catch (error) {
      console.log(error.message)
      throw new InternalServerErrorException(error.message);
    }

  }

  async find(filter: any): Promise<any> {
    console.log(filter)
    const queryParams = this.productDao.getFiltersProduct(filter);
    console.log(queryParams)
    const product = await this.productDao.find(queryParams);
    return product;
  }

  async getByFilter(filter: any): Promise<any> {
    const queryParams = this.productDao.getFiltersProducts(filter);
    let products = await this.productDao.getByFilter(queryParams);
    products = products.map(x => {
      return {
        id_producto: x.id_producto,
        codigo_producto: x.codigo_producto,
        nombre_producto: x.nombre_producto,
        descripcion_producto: x.descripcion_producto,
        precio_compra: x.precio_compra,
        precio_venta: x.precio_venta,
        id_categoria_producto: x.id_categoria_producto,
        categoria: {
          id_categoria_producto: x.id_categoria_producto,
          nombre_categoria: x.nombre_categoria
        },
        cantidad_disponible: x.cantidad_total
      }
    })

    return products;
  }

  async getProductVariants(idProducto: number): Promise<any> {
    let productVariants = await this.productDao.getProductVariants(idProducto);
    const resultado = Object.values(
      productVariants.reduce((acc, item) => {
        const idTalla = item.id_talla;

        if (!acc[idTalla]) {
          acc[idTalla] = {
            id_talla: idTalla,
            nombre_talla: item.nombre_talla,
            detalles: [],
          };
        }

        acc[idTalla].detalles.push({
          id_color: item.id_color,
          nombre_color: item.nombre_color,
          cantidad: item.cantidad,
        });

        return acc;
      }, {})
    );

    return resultado;
  }

  async update(body: any): Promise<void> {

    const { id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {

      const updateResponse = await this.productDao.update({
        id_producto, id_usuario_registro, codigo_producto: codigo_producto.trim(), nombre_producto: nombre_producto.trim(),
        descripcion_producto: descripcion_producto.trim(), precio_compra, precio_venta, id_categoria_producto
      }, queryRunner);
      console.log(updateResponse);

      if (updateResponse.errors) throw Error(updateResponse.errors);
      console.log(updateResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async save(body: SaveProductDto): Promise<void> {

    const { id_usuario_registro, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {

      const saveResponse = await this.productDao.save({
        id_usuario_registro, nombre_producto: nombre_producto.trim(),
        descripcion_producto: descripcion_producto ? descripcion_producto.trim() : null, precio_compra, precio_venta, id_categoria_producto
      }, queryRunner);
      console.log(saveResponse);

      if (saveResponse.errors) throw Error(saveResponse.errors);
      console.log(saveResponse);

      await queryRunner.commitTransaction();

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  async loadFromBuffer(data: any) {
    const workbook = new ExcelJS.Workbook();
    return await workbook.xlsx.load(data.data);
  }

  public async validSaveBulk(worksheet: any): Promise<SaveProductDto[]> {

    const formato = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Productos");
    const formato_detalle = await this.formatoCargaDAO.getFormatoDetalleCargaByIdFormato(formato.id_formato_carga);
    const formato_alias_columnas = formato_detalle.filter(x => x.es_obligatorio).map(x => x.alias_nombre_columna.toLowerCase());

    const columnas_archivo = worksheet.getRow(1).values.map(x => x.toLowerCase());
    const columnas_no_encontradas = formato_alias_columnas.filter(x => columnas_archivo.indexOf(x) < 0);
    if (columnas_no_encontradas.length > 0) {
      console.log(columnas_no_encontradas)
      throw Error("Formato del archivo no es el correcto");
    }

    const saveProductos: SaveProductDto[] = [];
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex == 1) return;
      if (!row.values[1] || !row.values[3] || !row.values[5]) return;
      const saveProducto: SaveProductDto = {
        nombre_producto: row.values[1],
        descripcion_producto: row.values[2],
        precio_compra: row.values[3],
        precio_venta: row.values[4],
        id_categoria_producto: row.values[5] ? row.values[5].result : 0,
        categoria_producto: row.values[6]
      }
      saveProductos.push(saveProducto)
    });
    return saveProductos;
  }

  async saveBulk(productos: SaveProductDto[], id_usuario_registro: number): Promise<any> {


    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(productos)
      const formatoCarga = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Productos");
      const carga = await this.cargaDAO.saveCarga(formatoCarga.id_formato_carga, id_usuario_registro);
      if (!carga.id_carga) {
        throw Error("Problema al registrar carga");
      }
      //return carga;
      const productosJSON = JSON.stringify(productos);
      const productosCarga = await this.productDao.saveBulk({ productos: productosJSON, id_carga: carga.id_carga }, queryRunner);
      if (productosCarga.errors) {
        await this.cargaDAO.updateCarga(carga.id_carga, 0, 0, productosCarga.errors);
        throw Error("Problema al registrar productos");
      }
      console.log(productosCarga)

      const data = productosCarga.data;
      let observacion = data.total_filas_incorrectas > 0 ? 'Se presentaron observaciones en los registros.' : '';
      const updateCarga = await this.cargaDAO.updateCarga(carga.id_carga, data.total_filas, data.total_filas_incorrectas, observacion);
      if (!updateCarga) {
        throw Error("Problema al actualizar carga");
      }

      await queryRunner.commitTransaction();

      return {
        carga: {
          id_carga: carga.id_carga,
          id_formato_carga: formatoCarga.id_formato_carga
        }
      };

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  public async validSaveIncomeBulk(worksheet: any): Promise<any> {

    const formato = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Inventario");
    const formato_detalle = await this.formatoCargaDAO.getFormatoDetalleCargaByIdFormato(formato.id_formato_carga);
    const formato_alias_columnas = formato_detalle.filter(x => x.es_obligatorio).map(x => x.alias_nombre_columna.toLowerCase());

    const columnas_archivo = worksheet.getRow(2).values.map(x => x.toLowerCase());
    const columnas_no_encontradas = formato_alias_columnas.filter(x => columnas_archivo.indexOf(x) < 0);
    if (columnas_no_encontradas.length > 0) {
      console.log(columnas_no_encontradas)
      throw Error("Formato del archivo no es el correcto");
    }
    const idTipoIngreso = worksheet.getRow(1).values[3] ? worksheet.getRow(1).values[3].result : 0;

    const incomes: SaveInventoryDto[] = [];
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex < 3) return;
      if (!row.values[1] || !row.values[2] || !row.values[4] || !row.values[6]) return;
      const saveInventoryItem: SaveInventoryDto = {
        codigo_producto: row.values[1],
        talla: row.values[2],
        id_talla: row.values[3] ? row.values[3].result : 0,
        color: row.values[4],
        id_color: row.values[5] ? row.values[5].result : 0,
        cantidad: row.values[6]
      }
      incomes.push(saveInventoryItem)
    });
    return {
      ingresos: incomes,
      id_tipo_ingreso: idTipoIngreso
    };
  }

  async saveIncomeBulk(ingresos: SaveInventoryDto[], id_tipo_ingreso: number, id_usuario_registro: number): Promise<any> {

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(ingresos)
      console.log({ id_tipo_ingreso, id_usuario_registro })

      const formatoCarga = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Inventario");
      const carga = await this.cargaDAO.saveCarga(formatoCarga.id_formato_carga, id_usuario_registro);
      if (!carga.id_carga) {
        throw Error("Problema al registrar carga");
      }

      //save
      const saveIncomeResponse = await this.productDao.saveIncome({
        id_tipo_ingreso, observacion: null, id_usuario_registro
      }, queryRunner);
      console.log(saveIncomeResponse);

      if (saveIncomeResponse.errors) {
        await this.cargaDAO.updateCarga(carga.id_carga, 0, 0, saveIncomeResponse.errors);
        throw Error(saveIncomeResponse.errors);
      }
      console.log(saveIncomeResponse);
      const idIngreso = saveIncomeResponse.data.id_ingreso;

      //return carga;
      const incomesJSON = JSON.stringify(ingresos);
      const saveIncomeBulkResponse = await this.productDao.saveIncomeBulk({ id_ingreso: idIngreso, ingresos: incomesJSON, id_carga: carga.id_carga }, queryRunner);
      if (saveIncomeBulkResponse.errors) {
        await this.cargaDAO.updateCarga(carga.id_carga, 0, 0, saveIncomeBulkResponse.errors);
        throw Error("Problema al registrar ingreso");
      }
      console.log(saveIncomeBulkResponse)

      const data = saveIncomeBulkResponse.data;
      let observacion = data.total_filas_incorrectas > 0 ? 'Se presentaron observaciones en los registros.' : '';
      const updateCarga = await this.cargaDAO.updateCarga(carga.id_carga, data.total_filas, data.total_filas_incorrectas, observacion);
      if (!updateCarga) {
        throw Error("Problema al actualizar carga");
      }

      await queryRunner.commitTransaction();

      return {
        carga: {
          id_carga: carga.id_carga,
          id_formato_carga: formatoCarga.id_formato_carga
        }
      };

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }

  POINTS_PER_MM: number = 2.83465;
  /**
   * Convierte milímetros a puntos
   * @param mm Milímetros
   * @returns Puntos
   */
  mmToPt(mm: number): number {
    return mm * this.POINTS_PER_MM;
  }

  async generateTags(ids_producto: number[], tipo: string) {

    const queryParams = this.productDao.getFiltersProducts({ ids_producto });
    let products = await this.productDao.getByFilter(queryParams);

    const pdfDoc = await PDFDocument.create();
    const width = this.mmToPt(48);
    const height = this.mmToPt(23);
    const margin = this.mmToPt(2);
    const usableWidth = width - margin * 2;   // ~124 pt
    const usableHeight = height - margin * 2; // 

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const page = pdfDoc.addPage([width, height]);

      // // Texto
      // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      // page.drawText(`Nombre: ${"nombre"}`, {
      //   x: 10,
      //   y: 120,
      //   size: 14,
      //   font,
      //   color: rgb(0, 0, 0),
      // });

      // page.drawText(`Código: ${"codigo"}`, {
      //   x: 10,
      //   y: 100,
      //   size: 12,
      //   font,
      //   color: rgb(0.2, 0.2, 0.2),
      // });

      // Generar código (QR o barras)
      let imageBytes: Buffer;
      if (tipo === 'qr') {
        const qrDataUrl = await QRCode.toDataURL(product.codigo_producto);
        imageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      } else {
        imageBytes = await bwipjs.toBuffer({
          bcid: 'code128',
          text: product.codigo_producto,
          scaleX: 2.5, // ancho por módulo
          scaleY: 3,   // altura por módulo
          height: 8,   // altura sin texto
          includetext: true
        });
      }

      const barcodeImage = await pdfDoc.embedPng(imageBytes);
      const scaleRatio = Math.min(
        usableWidth / barcodeImage.width,
        usableHeight / barcodeImage.height
      );
      const scaledWidth = barcodeImage.width * scaleRatio;
      const scaledHeight = barcodeImage.height * scaleRatio;

      const x = (width - scaledWidth) / 2; // Centrado horizontal
      const y = (height - scaledHeight) / 2;

      page.drawImage(barcodeImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
} 
