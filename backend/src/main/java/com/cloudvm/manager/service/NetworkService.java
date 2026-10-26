package com.cloudvm.manager.service;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.entity.CloudNetwork;
import com.cloudvm.manager.entity.VirtualMachine;
import com.cloudvm.manager.repository.CloudNetworkRepository;
import com.cloudvm.manager.repository.VirtualMachineRepository;
import com.cloudvm.manager.repository.VmNetworkLinkRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NetworkService {
    private final CloudNetworkRepository networks;
    private final VirtualMachineRepository vms;
    private final VmNetworkLinkRepository links;
    public NetworkService(CloudNetworkRepository networks, VirtualMachineRepository vms, VmNetworkLinkRepository links) {
        this.networks = networks; this.vms = vms; this.links = links;
    }
    @Transactional(readOnly = true)
    public List<NetworkDto> list(String owner) {
        List<CloudNetwork> rows = new ArrayList<>(networks.findByOwnerIdIsNullOrderByNameAsc());
        rows.addAll(networks.findByOwnerIdOrderByNameAsc(owner));
        return rows.stream().map(DtoMapper::network).toList();
    }
    @Transactional
    public NetworkDto create(NetworkRequest r, String owner) {
        return DtoMapper.network(networks.save(new CloudNetwork(r.networkName().trim(), r.networkType(), r.subnet(),
            r.gateway(), r.description(), owner)));
    }
    @Transactional(readOnly = true)
    public NetworkDto get(String id, String owner) { return DtoMapper.network(findVisible(id, owner)); }
    @Transactional(readOnly = true)
    public List<NetworkDto> vmNetworks(String vmId, String owner) {
        vms.findByIdAndOwnerId(vmId, owner).orElseThrow(() -> ApiException.notFound("Owned virtual machine"));
        return links.findByVmId(vmId).stream()
            .map(link -> networks.findById(link.getNetworkId()).orElse(null))
            .filter(n -> n != null && (n.getOwnerId() == null || owner.equals(n.getOwnerId())))
            .map(DtoMapper::network).toList();
    }
    @Transactional
    public NetworkDto update(String id, NetworkRequest r, String owner) {
        CloudNetwork n = findOwned(id, owner);
        n.update(r.networkName().trim(), r.networkType(), r.subnet(), r.gateway(), r.description(),
            r.status() == null ? n.getStatus() : r.status());
        return DtoMapper.network(n);
    }
    @Transactional
    public void delete(String id, String owner) {
        CloudNetwork network = findOwned(id, owner);
        links.deleteByNetworkId(network.getId());
        networks.delete(network);
    }
    @Transactional
    public void associate(String vmId, String networkId, String owner) {
        VirtualMachine vm = vms.findByIdAndOwnerId(vmId, owner).orElseThrow(() -> ApiException.notFound("Owned virtual machine"));
        CloudNetwork n = networks.findByIdAndOwnerId(networkId, owner).or(() -> networks.findById(networkId).filter(x -> x.getOwnerId() == null))
            .orElseThrow(() -> ApiException.notFound("Network"));
        if (!links.existsByVmIdAndNetworkId(vm.getId(), n.getId())) links.save(new com.cloudvm.manager.entity.VmNetworkLink(vm.getId(), n.getId()));
    }
    @Transactional
    public void disassociate(String vmId, String networkId, String owner) {
        vms.findByIdAndOwnerId(vmId, owner).orElseThrow(() -> ApiException.notFound("Owned virtual machine"));
        links.deleteByVmIdAndNetworkId(vmId, networkId);
    }
    private CloudNetwork findVisible(String id, String owner) {
        return networks.findByIdAndOwnerId(id, owner).or(() -> networks.findById(id).filter(n -> n.getOwnerId() == null))
            .orElseThrow(() -> ApiException.notFound("Network"));
    }
    private CloudNetwork findOwned(String id, String owner) {
        CloudNetwork n = networks.findById(id).orElseThrow(() -> ApiException.notFound("Network"));
        if (n.getOwnerId() == null) throw new ApiException(HttpStatus.FORBIDDEN, "Seeded shared networks are read-only");
        if (!owner.equals(n.getOwnerId())) throw ApiException.forbidden();
        return n;
    }
}
