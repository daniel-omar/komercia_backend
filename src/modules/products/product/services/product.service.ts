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
import { ProductVariantDto, SaveInventoryDto } from '../dto/save-inventory.dto';
import { SaveVariantsDto } from '../dto/save-variants.dto';
import { TagProductVariantDto } from '../dto/tag-products.dto';
import { FilterProductVariantDto } from '../dto/filter-product_variant.dto';
import { DateTime } from 'luxon';
import { FilterProductsDto } from '../dto/filter-products.dto';
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

  async getByFilter(filter: FilterProductsDto): Promise<any> {
    const queryParams = this.productDao.getFiltersProducts(filter);
    console.log(queryParams);
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
        cantidad_disponible: x.cantidad_total,
        es_activo: x.es_activo
      }
    })

    return products;
  }

  async getProductVariantsGroup(idProducto: number): Promise<any> {
    const queryParams = this.productDao.getFiltersProductsVariants({ id_producto: idProducto, es_activo: true });
    console.log(queryParams);
    let productVariants = await this.productDao.getProductVariantsByFilter(queryParams);
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
          codigo_producto_variante: item.codigo_producto_variante,
          id_color: item.id_color,
          nombre_color: item.nombre_color,
          cantidad: item.cantidad ?? 0,
        });

        return acc;
      }, {})
    );
    console.log(resultado)
    return resultado;
  }

  async getProductVariants(idProducto: number): Promise<any> {
    const queryParams = this.productDao.getFiltersProductsVariants({ id_producto: idProducto });
    console.log(queryParams)
    let productVariants = await this.productDao.getProductVariantsByFilter(queryParams);
    const resultado = productVariants.map(x => {
      return {
        id_producto_variante: x.id_producto_variante,
        codigo_producto_variante: x.codigo_producto_variante,
        id_producto: x.id_producto,
        id_talla: x.id_talla,
        talla: {
          id_talla: x.id_talla,
          nombre_talla: x.nombre_talla,
          codigo_talla: x.codigo_talla
        },
        id_color: x.id_color,
        color: {
          id_color: x.id_color,
          nombre_color: x.nombre_color,
          codigo_color: x.codigo_color
        },
        es_activo: x.es_activo,
        cantidad: x.cantidad ?? 0
      }

    })

    return resultado;
  }

  async update(body: any): Promise<void> {

    const { id_producto, id_usuario_registro, codigo_producto, nombre_producto, descripcion_producto, precio_compra, precio_venta, id_categoria_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log(body);

    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateResponse = await this.productDao.update({
        id_producto, id_usuario_registro, codigo_producto: codigo_producto.trim(), nombre_producto: nombre_producto.trim(),
        descripcion_producto: descripcion_producto.trim(), precio_compra, precio_venta, id_categoria_producto,
        fecha_hora_actualizacion: fechaHoraRegistro
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

  async updateActive(body: any): Promise<void> {

    const { id_usuario_registro, es_activo, id_producto } = body;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(body)
    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const updateActiveResponse = await this.productDao.updateActive({
        id_usuario_registro,
        id_producto: id_producto,
        es_activo: es_activo,
        fecha_hora_actualizacion: fechaHoraRegistro
      }, queryRunner);

      if (updateActiveResponse.errors) throw Error(updateActiveResponse.errors);
      console.log(updateActiveResponse);

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
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');

      const saveResponse = await this.productDao.save({
        id_usuario_registro, nombre_producto: nombre_producto.trim(),
        descripcion_producto: descripcion_producto ? descripcion_producto.trim() : null, precio_compra, precio_venta, id_categoria_producto,
        fecha_hora_registro: fechaHoraRegistro
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

  async saveVariants(saveVariantes: SaveVariantsDto): Promise<void> {

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      console.log(saveVariantes)
      const { variantes, id_usuario_registro } = saveVariantes;

      const saveVariantsResponse = await this.productDao.saveVariants(
        JSON.stringify(variantes),
        id_usuario_registro,
        fechaHoraRegistro,
        queryRunner
      );
      if (saveVariantsResponse.errors) {
        throw Error(saveVariantsResponse.errors);
      }
      console.log(saveVariantsResponse);

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
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      const formatoCarga = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Productos");
      const carga = await this.cargaDAO.saveCarga(formatoCarga.id_formato_carga, id_usuario_registro, fechaHoraRegistro);
      if (!carga.id_carga) {
        throw Error("Problema al registrar carga");
      }
      //return carga;
      const productosJSON = JSON.stringify(productos);
      const productosCarga = await this.productDao.saveBulk({ productos: productosJSON, id_carga: carga.id_carga, fecha_hora_registro: fechaHoraRegistro }, queryRunner);
      if (productosCarga.errors) {
        await this.cargaDAO.updateCarga(carga.id_carga, 0, 0, productosCarga.errors);
        throw Error("Problema al registrar productos");
      }

      const data = productosCarga.data;
      if (data.total_filas_incorrectas > 0) {
        throw Error(data.observaciones);
      }

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

  // public async validSaveIncomeBulk(worksheet: any): Promise<any> {

  //   const formato = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Inventario");
  //   const formato_detalle = await this.formatoCargaDAO.getFormatoDetalleCargaByIdFormato(formato.id_formato_carga);
  //   const formato_alias_columnas = formato_detalle.filter(x => x.es_obligatorio).map(x => x.alias_nombre_columna.toLowerCase());

  //   const columnas_archivo = worksheet.getRow(2).values.map(x => x.toLowerCase());
  //   const columnas_no_encontradas = formato_alias_columnas.filter(x => columnas_archivo.indexOf(x) < 0);
  //   if (columnas_no_encontradas.length > 0) {
  //     console.log(columnas_no_encontradas)
  //     throw Error("Formato del archivo no es el correcto");
  //   }
  //   const idTipoIngreso = worksheet.getRow(1).values[3] ? worksheet.getRow(1).values[3].result : 0;

  //   const incomes: SaveInventoryDto[] = [];
  //   worksheet.eachRow((row, rowIndex) => {
  //     if (rowIndex < 3) return;
  //     if (!row.values[1] || !row.values[2] || !row.values[4] || !row.values[6]) return;
  //     const saveInventoryItem: SaveInventoryDto = {
  //       codigo_producto: row.values[1],
  //       talla: row.values[2],
  //       id_talla: row.values[3] ? row.values[3].result : 0,
  //       color: row.values[4],
  //       id_color: row.values[5] ? row.values[5].result : 0,
  //       cantidad: row.values[6]
  //     }
  //     incomes.push(saveInventoryItem)
  //   });
  //   return {
  //     ingresos: incomes,
  //     id_tipo_ingreso: idTipoIngreso
  //   };
  // }

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

    const incomes: ProductVariantDto[] = [];
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex < 3) return;
      if (!row.values[1] || !row.values[2] || !row.values[3]) return;
      const saveInventoryItem: ProductVariantDto = {
        id_producto_variante: row.values[1],
        codigo_producto_variante: row.values[2],
        cantidad: row.values[3]
      }
      incomes.push(saveInventoryItem)
    });

    return {
      ingresos: incomes,
      id_tipo_ingreso: idTipoIngreso
    };
  }

  async saveIncomeBulk(productsVariants: ProductVariantDto[], id_tipo_ingreso: number, id_usuario_registro: number): Promise<any> {

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log({ id_tipo_ingreso, id_usuario_registro })
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      const formatoCarga = await this.formatoCargaDAO.getFormatoCargaByNombre("Carga Inventario");
      const carga = await this.cargaDAO.saveCarga(formatoCarga.id_formato_carga, id_usuario_registro, fechaHoraRegistro);
      if (!carga.id_carga) {
        throw Error("Problema al registrar carga");
      }

      //save
      const saveIncomeResponse = await this.productDao.saveIncome({
        id_tipo_ingreso, observacion: null, id_usuario_registro, fecha_hora_registro: fechaHoraRegistro
      }, queryRunner);
      console.log(saveIncomeResponse);

      if (saveIncomeResponse.errors) {
        await this.cargaDAO.updateCarga(carga.id_carga, 0, 0, saveIncomeResponse.errors);
        throw Error(saveIncomeResponse.errors);
      }
      console.log(saveIncomeResponse);
      const idIngreso = saveIncomeResponse.data.id_ingreso;

      //return carga;
      const incomesJSON = JSON.stringify(productsVariants);
      const saveIncomeBulkResponse = await this.productDao.saveIncomeDetailsBulk({ id_ingreso: idIngreso, ingreso_detalles: incomesJSON, id_carga: carga.id_carga }, queryRunner);
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

  async saveIncome(productsVariants: ProductVariantDto[], id_tipo_ingreso: number, id_usuario_registro: number): Promise<any> {

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log("productsVariants: ", productsVariants);
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      //save
      const saveIncomeResponse = await this.productDao.saveIncome({
        id_tipo_ingreso, observacion: null, id_usuario_registro, fecha_hora_registro: fechaHoraRegistro
      }, queryRunner);
      console.log(saveIncomeResponse);
      if (saveIncomeResponse.errors) {
        throw Error(saveIncomeResponse.errors);
      }
      const idIngreso = saveIncomeResponse.data.id_ingreso;

      const incomesJSON = JSON.stringify(productsVariants);
      const saveIncomeBulkResponse = await this.productDao.saveIncomeDetails({ id_ingreso: idIngreso, ingreso_detalles: incomesJSON }, queryRunner);
      if (saveIncomeBulkResponse.errors) {
        throw Error("Problema al registrar ingreso");
      }
      console.log(saveIncomeBulkResponse)
      await queryRunner.commitTransaction();
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

  async generateTagsV2(productosVariantes: TagProductVariantDto[], tipo: string) {
    console.log("productosVariantes: ", productosVariantes);
    const idsProductoVariante = productosVariantes.map(x => x.id_producto_variante);
    const queryParams = this.productDao.getFiltersProductsVariants({ ids_producto_variante: idsProductoVariante });
    let productsVariants = await this.productDao.getProductVariantsByFilter(queryParams);

    const pdfDoc = await PDFDocument.create();
    const width = this.mmToPt(48);
    const height = this.mmToPt(23);
    const margin = this.mmToPt(2);
    const usableWidth = width - margin * 2;   // ~124 pt
    const usableHeight = height - margin * 1.5; // 
    const lineHeight = this.mmToPt(1.8);
    const fontSize = 8.5;

    for (let index = 0; index < productsVariants.length; index++) {
      const productVariant = productsVariants[index];
      const cantidad = productosVariantes.find(x => x.id_producto_variante == productVariant.id_producto_variante)?.cantidad ?? 0;

      for (let subindex = 0; subindex < cantidad; subindex++) {
        const page = pdfDoc.addPage([width, height]);
        let textYPosition = usableHeight; // Posición para el texto del nombre

        // Texto
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        let text = `${productVariant.nombre_producto}`;
        let textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(`${productVariant.nombre_producto}`, {
          x: (width - textWidth) / 2,
          y: textYPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        textYPosition -= lineHeight * 1.5;

        text = `${productVariant.codigo_talla} //  ${productVariant.codigo_color}`;
        textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(`${productVariant.codigo_talla} //  ${productVariant.codigo_color}`, {
          x: (width - textWidth) / 2,
          y: textYPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        textYPosition -= lineHeight - this.mmToPt(1);

        // Generar código (QR o barras)
        let imageBytes: Buffer;
        if (tipo === 'qr') {
          const qrDataUrl = await QRCode.toDataURL(productVariant.codigo_producto_variante);
          imageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        } else {
          imageBytes = await bwipjs.toBuffer({
            bcid: 'code128',
            text: productVariant.codigo_producto_variante,
            scaleX: 4,              // Aumenta ancho de las barras
            scaleY: 4,              // Aumenta altura general
            height: 18,  // altura sin texto
            // width: 20,
            includetext: true,
            textsize: 15,
            textfont: 'Helvetica-Bold',
            textxalign: 'center',
            textyoffset: 0,
          });
        }

        const barcodeImage = await pdfDoc.embedPng(imageBytes);
        const scaleDown = 0.15; // Escalar para que no se vea gigante
        const { width: scaledWidth, height: scaledHeight } = barcodeImage.scale(scaleDown);

        // const scaleRatio = Math.min(
        //   usableWidth / barcodeImage.width,
        //   usableHeight / barcodeImage.height
        // );
        // const scaledWidth = barcodeImage.width * scaleRatio;
        // const scaledHeight = barcodeImage.height * scaleRatio;

        const x = (width - scaledWidth) / 2; // Centrado horizontal
        const y = textYPosition - scaledHeight;

        page.drawImage(barcodeImage, {
          x: x + 5,
          y,
          width: scaledWidth - 10,
          height: scaledHeight,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  async findProductVariant(filter: FilterProductVariantDto): Promise<any> {
    const queryParams = this.productDao.getFiltersProductVariant(filter);
    console.log(queryParams);
    const productVariant = await this.productDao.findProductVariant(queryParams);

    if (!productVariant) return null;

    const resultado = {
      id_producto_variante: productVariant.id_producto_variante,
      codigo_producto_variante: productVariant.codigo_producto_variante,
      id_producto: productVariant.id_producto,
      nombre_producto: productVariant.nombre_producto,
      id_talla: productVariant.id_talla,
      talla: {
        id_talla: productVariant.id_talla,
        nombre_talla: productVariant.nombre_talla,
        codigo_talla: productVariant.codigo_talla
      },
      id_color: productVariant.id_color,
      color: {
        id_color: productVariant.id_color,
        nombre_color: productVariant.nombre_color,
        codigo_color: productVariant.codigo_color
      },
      es_activo: productVariant.es_activo,
      cantidad: productVariant.cantidad ?? 0,
      precio_compra: productVariant.precio_compra,
      precio_venta: productVariant.precio_venta
    };

    return resultado;
  }

  async saveOutput(productsVariants: ProductVariantDto[], id_usuario_registro: number): Promise<any> {

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log("productsVariants: ", productsVariants);
      const fechaHoraRegistro = DateTime.now().setZone('America/Lima').toFormat('yyyy-LL-dd HH:mm:ss');
      //save
      const saveOutputResponse = await this.productDao.saveOutput({
        observacion: '', id_usuario_registro, fecha_hora_registro: fechaHoraRegistro
      }, queryRunner);
      console.log(saveOutputResponse);
      if (saveOutputResponse.errors) {
        throw Error(saveOutputResponse.errors);
      }
      const idSalida = saveOutputResponse.data.id_salida;

      const incomesJSON = JSON.stringify(productsVariants);
      const saveOutputBulkResponse = await this.productDao.saveOutputDetails({ id_salida: idSalida, salida_detalles: incomesJSON }, queryRunner);
      if (saveOutputBulkResponse.errors) {
        throw Error("Problema al registrar salida");
      }
      console.log(saveOutputBulkResponse)
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw Error(error.message);
    } finally {
      await queryRunner.release();
    }

  }
} 
