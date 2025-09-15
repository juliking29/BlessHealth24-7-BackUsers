type Protocol = 'http' | 'https';

export default class ExpressProvider {
  private static _instance: ExpressProvider | null = null;

  private readonly _host: string;
  private readonly _port: number;
  private readonly _protocol: Protocol;
  private readonly _certKey?: string;
  private readonly _certPem?: string;

  private constructor() {
    const hostEnv = process.env['HOST'];
    const portEnv = process.env['PORT'];
    const protocolEnv = process.env['PROTOCOL'];
    const certKeyEnv = process.env['CERT_KEY'];
    const certPemEnv = process.env['CERT_PEM'];

    const host = (hostEnv ?? '0.0.0.0').trim();
    this._host = host;

    const rawPort = (portEnv ?? '3000').trim();
    const portNum = Number(rawPort);
    if (!Number.isFinite(portNum) || portNum <= 0) {
      throw new Error(`PORT inválido: ${rawPort}`);
    }
    this._port = portNum;

    const proto = (protocolEnv ?? 'http').toLowerCase();
    this._protocol = proto === 'https' ? 'https' : 'http';

    const certKey = certKeyEnv?.trim();
    const certPem = certPemEnv?.trim();
    this._certKey = certKey && certKey.length > 0 ? certKey : undefined;
    this._certPem = certPem && certPem.length > 0 ? certPem : undefined;
  }

  private static instance(): ExpressProvider {
    if (ExpressProvider._instance === null) {
      ExpressProvider._instance = new ExpressProvider();
    }
    return ExpressProvider._instance;
  }

  public static getHost(): string {
    return ExpressProvider.instance()._host;
  }
  public static getPort(): number {
    return ExpressProvider.instance()._port;
  }
  public static getProtocol(): Protocol {
    return ExpressProvider.instance()._protocol;
  }
  public static getAPIDomain(): string {
    const inst = ExpressProvider.instance();
    const isDefaultHttp = inst._protocol === 'http' && inst._port === 80;
    const isDefaultHttps = inst._protocol === 'https' && inst._port === 443;
    const portPart = (isDefaultHttp || isDefaultHttps) ? '' : `:${inst._port}`;
    return `${inst._protocol}://${inst._host}${portPart}`;
  }
  public static getCertKey(): string | undefined {
  return ExpressProvider.instance()._certKey;
}
public static getCertPem(): string | undefined {
  return ExpressProvider.instance()._certPem;
}
}