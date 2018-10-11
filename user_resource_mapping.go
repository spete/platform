package platform

import (
	"context"
	"errors"
	"fmt"
)

type UserType string
type ResourceType string

const (
	Owner                 UserType     = "owner"
	Member                UserType     = "member"
	DashboardResourceType ResourceType = "dashboard"
	BucketResourceType    ResourceType = "bucket"
	TaskResourceType      ResourceType = "task"
	OrgResourceType       ResourceType = "org"
	ViewResourceType      ResourceType = "view"
)

// UserResourceMappingService maps the relationships between users and resources
type UserResourceMappingService interface {
	// FindUserResourceMappings returns a list of UserResourceMappings that match filter and the total count of matching mappings.
	FindUserResourceMappings(ctx context.Context, filter UserResourceMappingFilter, opt ...FindOptions) ([]*UserResourceMapping, int, error)

	// FindDeepUserResourceMappings returns a list of UserResourceMappings that belong to a user or to orgs that the user belongs to.
	FindDeepUserResourceMappings(ctx context.Context, filter DeepUserResourceMappingFilter) ([]*UserResourceMapping, int, error)

	// CreateUserResourceMapping creates a user resource mapping
	CreateUserResourceMapping(ctx context.Context, m *UserResourceMapping) error

	// DeleteUserResourceMapping deletes a user resource mapping
	DeleteUserResourceMapping(ctx context.Context, resourceID ID, userID ID) error
}

// UserResourceMapping represents a mapping of a resource to its user
type UserResourceMapping struct {
	ResourceID   ID           `json:"resource_id"`
	ResourceType ResourceType `json:"resource_type"`
	UserID       ID           `json:"user_id"`
	UserType     UserType     `json:"user_type"`
}

// Validate reports any validation errors for the mapping.
func (m UserResourceMapping) Validate() error {
	if !m.ResourceID.Valid() {
		return errors.New("resourceID is required")
	}
	if !m.UserID.Valid() {
		return errors.New("userID is required")
	}
	if m.UserType != Owner && m.UserType != Member {
		return errors.New("a valid user type is required")
	}
	switch m.ResourceType {
	case DashboardResourceType, BucketResourceType, TaskResourceType, OrgResourceType, ViewResourceType:
	default:
		return fmt.Errorf("a valid resource type is required")
	}
	return nil
}

// UserResourceMapping represents a set of filters that restrict the returned results.
type UserResourceMappingFilter struct {
	ResourceID   ID
	ResourceType ResourceType
	UserID       ID
	UserType     UserType
}

// DeepUserResourceMappingFilter is a set of filters for returning nested ownership mappings.
type DeepUserResourceMappingFilter struct {
	UserID       ID
	ResourceType ResourceType
}
