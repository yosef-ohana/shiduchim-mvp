package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserNotification;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserNotificationRepositoryTest {

    @Test
    void testUniqueEventKeyConstraint() throws NoSuchFieldException {
        // Prove that the eventKey is uniquely enforced via JPA annotations

        // 1. Check @Table uniqueConstraints
        Table tableAnnotation = UserNotification.class.getAnnotation(Table.class);
        boolean hasTableUniqueConstraint = false;
        if (tableAnnotation != null) {
            hasTableUniqueConstraint = Arrays.stream(tableAnnotation.uniqueConstraints())
                    .anyMatch(uc -> Arrays.asList(uc.columnNames()).contains("event_key"));
        }

        // 2. Check @Column(unique = true)
        Field eventKeyField = UserNotification.class.getDeclaredField("eventKey");
        Column columnAnnotation = eventKeyField.getAnnotation(Column.class);
        boolean hasColumnUnique = columnAnnotation != null && columnAnnotation.unique();

        assertTrue(hasTableUniqueConstraint || hasColumnUnique, "eventKey must have a unique constraint");
    }
}
