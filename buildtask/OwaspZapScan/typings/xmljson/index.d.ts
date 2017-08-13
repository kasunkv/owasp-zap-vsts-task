declare module 'xmljson' {
    function to_json(xml:string, callback: (err: any, res: any) => void): void;
    function to_xml(json:any, callback: (err: any, res: any) => void): void;
}