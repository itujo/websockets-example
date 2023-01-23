import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ListPrintersResponse } from '../@types/printers';

const socket = io('http://172.21.240.1:8475');

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [printers, setPrinters] = useState<ListPrintersResponse[] | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('listPrinters');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('printerList', (list: ListPrintersResponse[]) => {
      setPrinters(list);
      console.log(list);

      setSelectedPrinter(list[0].name);
    });

    socket.on('printSuccess', (jobId) => {
      console.log(jobId);

      alert(`sucesso! jobId: ${jobId}`);
    });

    socket.on('printError', (e) => {
      console.log(e);

      alert(`erro! jobId: ${e}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('printerList');
    };
  }, []);

  const printZpl = () => {
    const zpl = `^XA

^FX Top section with logo, name and address.
^CF0,60
^FO50,50^GB100,100,100^FS
^FO75,75^FR^GB100,100,100^FS
^FO93,93^GB40,40,40^FS
^FO220,50^FDAnjun Brasil^FS
^CF0,30
^FO220,115^FDEndereço da Anjun Brasil^FS
^FO220,155^FDShelbyville TN 38102^FS
^FO220,195^FDUnited States (USA)^FS
^FO50,250^GB700,3,3^FS

^FX Second section with recipient address and permit information.
^CFA,30
^FO50,300^FDJohn Doe^FS
^FO50,340^FD100 Main Street^FS
^FO50,380^FDSpringfield TN 39021^FS
^FO50,420^FDUnited States (USA)^FS
^CFA,15
^FO600,300^GB150,150,3^FS
^FO638,340^FDPermit^FS
^FO638,390^FD123456^FS
^FO50,500^GB700,3,3^FS

^FX Third section with bar code.
^BY5,2,270
^FO100,550^BC^FD12345678^FS

^FX Fourth section (the two boxes on the bottom).
^FO50,900^GB700,250,3^FS
^FO400,900^GB3,250,3^FS
^CF0,40
^FO100,960^FDCtr. X34B-1^FS
^FO100,1010^FDREF1 F00B47^FS
^FO100,1060^FDREF2 BL4H8^FS
^CF0,190
^FO470,955^FDCA^FS

^XZ`;
    if (!selectedPrinter) return;
    socket.emit('printZpl', { selectedPrinter, zpl });
  };

  return (
    <div>
      <p>Connected: {'' + isConnected}</p>
      <p>selected printer: {selectedPrinter || '-'}</p>
      <select onChange={(e) => setSelectedPrinter(e.target.value)}>
        {printers &&
          printers.map((printer, idx) => {
            return (
              <option value={printer.name} key={idx}>
                {printer.name}
              </option>
            );
          })}
      </select>

      <button onClick={printZpl}>imprimir</button>
    </div>
  );
}
