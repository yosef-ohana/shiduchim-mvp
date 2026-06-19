package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.block.BlockUserResponse;
import com.shiduchim.backend.dto.block.BlockedUserResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserBlock;
import com.shiduchim.backend.enums.UserBlockStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserBlockRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserBlockService {

    private final UserBlockRepository userBlockRepository;
    private final UserRepository userRepository;

    public UserBlockService(UserBlockRepository userBlockRepository, UserRepository userRepository) {
        this.userBlockRepository = userBlockRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BlockUserResponse blockUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can block other users");
        }

        if (currentUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Self-blocking is not allowed");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (!targetUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only block users");
        }

        UserBlock userBlock = userBlockRepository.findByBlockerUserIdAndBlockedUserId(currentUser.getId(), targetUserId)
                .orElseGet(() -> {
                    UserBlock newBlock = new UserBlock();
                    newBlock.setBlockerUserId(currentUser.getId());
                    newBlock.setBlockedUserId(targetUserId);
                    return newBlock;
                });

        if (userBlock.getStatus() == null || userBlock.getStatus() == UserBlockStatus.UNBLOCKED) {
            userBlock.setStatus(UserBlockStatus.ACTIVE);
        }
        
        userBlock = userBlockRepository.save(userBlock);
        
        return mapToBlockUserResponse(userBlock);
    }

    @Transactional
    public BlockUserResponse unblockUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can unblock other users");
        }

        UserBlock userBlock = userBlockRepository.findByBlockerUserIdAndBlockedUserId(currentUser.getId(), targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Block not found"));

        if (userBlock.getStatus() == UserBlockStatus.ACTIVE) {
            userBlock.setStatus(UserBlockStatus.UNBLOCKED);
            userBlock.setUnblockedAt(LocalDateTime.now());
            userBlock = userBlockRepository.save(userBlock);
        }

        return mapToBlockUserResponse(userBlock);
    }

    @Transactional(readOnly = true)
    public List<BlockedUserResponse> getBlockedUsers(User currentUser) {
        if (!currentUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can view blocked users");
        }

        List<UserBlock> activeBlocks = userBlockRepository.findByBlockerUserIdAndStatus(currentUser.getId(), UserBlockStatus.ACTIVE);

        return activeBlocks.stream().map(block -> {
            BlockedUserResponse response = new BlockedUserResponse();
            response.setId(block.getId());
            response.setBlockedUserId(block.getBlockedUserId());
            response.setCreatedAt(block.getCreatedAt());

            userRepository.findById(block.getBlockedUserId()).ifPresent(user -> {
                response.setFullName(user.getFullName());
            });

            return response;
        }).collect(Collectors.toList());
    }

    private BlockUserResponse mapToBlockUserResponse(UserBlock userBlock) {
        BlockUserResponse response = new BlockUserResponse();
        response.setId(userBlock.getId());
        response.setBlockerUserId(userBlock.getBlockerUserId());
        response.setBlockedUserId(userBlock.getBlockedUserId());
        response.setStatus(userBlock.getStatus());
        response.setCreatedAt(userBlock.getCreatedAt());
        response.setUpdatedAt(userBlock.getUpdatedAt());
        response.setUnblockedAt(userBlock.getUnblockedAt());
        return response;
    }

    /**
     * Returns true if an ACTIVE block exists in either direction between userA and userB.
     * Used by other services to enforce UserBlock visibility/access filtering.
     */
    public boolean existsActiveBlockBetween(Long userAId, Long userBId) {
        return userBlockRepository.existsActiveBlockBetween(userAId, userBId);
    }
}
