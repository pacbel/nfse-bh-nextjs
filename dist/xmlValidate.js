"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateXmlAgainstXsd = validateXmlAgainstXsd;
exports.validateXml = validateXml;
/**
 * Valida um documento XML contra um schema XSD
 * @param xmlString String contendo o XML a ser validado
 * @param xsdString String contendo o XSD para validação
 * @returns Objeto contendo o resultado da validação e possíveis erros
 */
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var libxmljs2_1 = __importDefault(require("libxmljs2"));
function validateXmlAgainstXsd(xmlString, xsdString) {
    console.log("[DEBUG] Iniciando validação XML contra XSD");
    try {
        // Carregar o arquivo XSD principal e o arquivo de assinatura digital
        var xsdPath = path.join(process.cwd(), "documentacao", "nfse_schemas10", "nfse.xsd");
        var xmldsigPath = path.join(process.cwd(), "documentacao", "nfse_schemas10", "xmldsig-core-schema20020212.xsd");
        console.log("[DEBUG] Caminhos dos arquivos XSD:", {
            xsdPath: xsdPath,
            xmldsigPath: xmldsigPath,
        });
        if (!fs.existsSync(xsdPath)) {
            console.error("[ERROR] Arquivo XSD principal não encontrado:", xsdPath);
            return {
                isValid: false,
                errors: [
                    {
                        line: 0,
                        column: 0,
                        message: "Arquivo XSD principal não encontrado",
                        code: "SCHEMA_NOT_FOUND",
                    },
                ],
            };
        }
        if (!fs.existsSync(xmldsigPath)) {
            console.error("[ERROR] Arquivo XSD de assinatura digital não encontrado:", xmldsigPath);
            return {
                isValid: false,
                errors: [
                    {
                        line: 0,
                        column: 0,
                        message: "Arquivo XSD de assinatura digital não encontrado",
                        code: "SCHEMA_NOT_FOUND",
                    },
                ],
            };
        }
        // Carregar os arquivos XSD
        console.log("[DEBUG] Carregando conteúdo dos arquivos XSD");
        var xsdContent = fs.readFileSync(xsdPath, "utf8");
        var xmldsigContent = fs.readFileSync(xmldsigPath, "utf8");
        console.log("[DEBUG] Arquivos XSD carregados com sucesso");
        try {
            console.log("[DEBUG] Iniciando parse dos documentos XML e XSD");
            // Criar documentos XML e XSD
            var xsdDoc = libxmljs2_1.default.parseXml(xsdContent);
            var xmlDoc = libxmljs2_1.default.parseXml(xmlString);

            console.log("[DEBUG] Documento XML:", xmlString);
            
            console.log("[DEBUG] Parse dos documentos XML e XSD concluído com sucesso");
            console.log("[DEBUG] Iniciando validação do XML contra XSD");
            // Validar XML contra XSD
            var isValid = xmlDoc.validate(xsdDoc);
            console.log("[DEBUG] Resultado da validação:", isValid ? "Válido" : "Inválido");
            if (!isValid) {
                console.log("[DEBUG] Coletando erros de validação");
                // Coletar erros de validação
                var validationErrors = xmlDoc.validationErrors.map(function (error) {
                    console.log("[DEBUG] Erro de validação:", error);
                    return {
                        line: error.line || 0,
                        column: error.column || 0,
                        message: error.message || "Erro não especificado",
                        code: error.code || "VALIDATION_ERROR",
                        path: extractXPathFromError(error),
                    };
                });
                return {
                    isValid: false,
                    errors: validationErrors,
                };
            }
            return { isValid: true };
        }
        catch (parseError) {
            console.error("[ERROR] Erro ao fazer parse do XML/XSD:", parseError);
            return {
                isValid: false,
                errors: [
                    {
                        line: parseError.line || 0,
                        column: parseError.column || 0,
                        message: "Erro ao processar XML/XSD: ".concat(parseError.message),
                        code: "PARSE_ERROR",
                    },
                ],
            };
        }
    }
    catch (error) {
        console.error("[ERROR] Erro ao carregar arquivos XSD:", error);
        return {
            isValid: false,
            errors: [
                {
                    line: error.line || 0,
                    column: error.column || 0,
                    message: "Erro ao carregar arquivos XSD: ".concat(error.message),
                    code: "SCHEMA_ERROR",
                },
            ],
        };
    }
}
/**
 * Tenta extrair o caminho XPath do erro de validação
 * (Implementação simplificada - pode precisar ser ajustada conforme a estrutura exata dos erros)
 */
function extractXPathFromError(error) {
    if (error.message) {
        // Tenta extrair o caminho do elemento com problema a partir da mensagem de erro
        var pathMatch = error.message.match(/Element '([^']+)'/);
        if (pathMatch && pathMatch[1]) {
            return pathMatch[1];
        }
    }
    return undefined;
}
/**
 * Valida um documento XML
 * @param options Opções de validação
 * @returns Objeto contendo o resultado da validação e possíveis erros
 */
function validateXml(options) {
    var _a, _b;
    var xmlContent = options.xmlContent, _c = options.throwOnError, throwOnError = _c === void 0 ? false : _c;
    console.log("[DEBUG] Iniciando validação do XML com opções:", {
        throwOnError: throwOnError,
    });
    try {
        console.log("[DEBUG] Preparando conteúdo XML para validação");
        // Por enquanto, apenas validamos a estrutura básica do XML
        // Futuramente, podemos adicionar a validação contra XSD
        var result = validateXmlAgainstXsd(xmlContent, "");
        console.log("[DEBUG] Resultado da validação:", result);
        if (!result.isValid && throwOnError) {
            throw new Error("XML validation failed: " + ((_b = (_a = result.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message));
        }
        return result;
    }
    catch (error) {
        var validationError = {
            line: error.line || 0,
            column: error.column || 0,
            message: error.message || "Unknown validation error",
            code: "VALIDATION_ERROR",
        };
        if (throwOnError) {
            throw error;
        }
        return {
            isValid: false,
            errors: [validationError],
        };
    }
}
