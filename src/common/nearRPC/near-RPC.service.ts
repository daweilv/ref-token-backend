import { Logger } from "@nestjs/common";
import { Cfg } from "../../../config";
import axios from "axios";

export class NearRPCService {
  private _rpc_addr: any;
  private readonly logger = new Logger(NearRPCService.name);

  async connect() {
    const nodes = Cfg.NETWORK[Cfg.NETWORK_ID].NEAR_RPC_URL;
    let best_height = 0;
    let best_node = null;
    for (const node of nodes) {
      this._rpc_addr = node;
      const node_status = await this.ping_node();
      this.logger.log(node, node_status);

      if (
        !node_status["syncing"] &&
        node_status["latest_block_height"] > best_height + 10
      ) {
        best_height = node_status["latest_block_height"];
        best_node = node;
      }
    }

    if (best_node) {
      this.logger.log("Choose near rpc node", best_node);
      this._rpc_addr = best_node;
    } else {
      throw new Error("No available nodes");
    }
  }

  async rpc_addr() {
    if (!this._rpc_addr) {
      await this.connect();
    }
    return this._rpc_addr;
  }

  async json_rpc(method, params, timeout = 2000) {
    const j = {
      method: method,
      params: params,
      id: "dontcare",
      jsonrpc: "2.0",
    };
    // this.logger.debug("json_rpc req", j);
    const rpc_addr = await this.rpc_addr();
    const { data: content } = await axios.post(rpc_addr, j, { timeout });
    // this.logger.debug("json_rpc res", content);
    if (content.error) throw new Error(content.error);
    return content.result;
  }

  get_status() {
    return this.json_rpc("status", []);
  }

  async ping_node() {
    const ret = { latest_block_height: 0, syncing: true };
    try {
      const status = await this.get_status();
      if (status.sync_info) {
        ret["latest_block_height"] = status["sync_info"]["latest_block_height"];
        ret["syncing"] = status["sync_info"]["syncing"];
      }
    } catch (err) {
      this.logger.error(err);
    }
    return ret;
  }

  view_call(account_id, method_name, args, finality = "optimistic") {
    // this.logger.debug("view_call args", args);
    return this.json_rpc("query", {
      request_type: "call_function",
      account_id: account_id,
      method_name: method_name,
      args_base64: Buffer.from(args).toString("base64"),
      finality: finality,
    });
  }
}
