function RetrieveParametersOfSecureServer()
 {
  return {Configurations: [{Name: 'EPOS SERVER',
                            Address: '192.168.1.34',
                            Port: 3001},
                           /*
                           {Name: 'Internal Server',
                            Address: '192.168.10.69',
                            Port: 5599},
                           {Name: 'External Server',
                            Address: '',
                            AddressOfExternalServer: '84.237.20.67',
                            Port: 8888}
                           */],
          SSL_Information: {PathToSSLDataDirectory: 'D:/Server/Apache/conf/SSL/',
                            //PathToSSLDataDirectory: '/usr/local/etc/apache24/SSL/',
                            NameOfCertificatesDirectory: 'Certificates',
                            DHParametersFile: 'DHParameters.pem',
                            MainCertificateFile: 'main.crt',
                            CertificateFile: 'server.crt',
                            KeyFile: 'server.key'}};
 }

exports.Load = RetrieveParametersOfSecureServer;
